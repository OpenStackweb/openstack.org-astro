import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSoftwareRefresh } from '../../src/lib/server/software-refresh.mjs';
import { prepareSoftwareRefresh } from '../lib/software-refresh.mjs';
import { softwareCandidateFiles } from '../lib/software-candidate.mjs';

const url = 'https://astro.openstack.org/api/cms/software-refresh';
const env = {
  PUBLIC_TINA_CLIENT_ID: 'project',
  SOFTWARE_REFRESH_GITHUB_TOKEN: 'server-only-secret',
};
const member = async () => ({ verified: true, enabled: true });
const request = (method = 'GET', origin = 'https://astro.openstack.org') =>
  new Request(url, { method, headers: { authorization: 'Bearer editor', origin } });
const reply = (x) => Response.json(x);

test('refresh requires authenticated enabled membership and rejects cross-origin POST before GitHub', async () => {
  const never = () => {
    throw Error('GitHub must not be called');
  };
  assert.equal((await handleSoftwareRefresh(new Request(url), env, {}, member, never)).status, 401);
  assert.equal(
    (
      await handleSoftwareRefresh(
        request(),
        env,
        {},
        async () => ({ verified: true, enabled: false }),
        never,
      )
    ).status,
    403,
  );
  assert.equal(
    (await handleSoftwareRefresh(request('POST', 'https://elsewhere.test'), env, {}, member, never))
      .status,
    403,
  );
  assert.equal(
    (
      await handleSoftwareRefresh(
        request(),
        env,
        {},
        async () => {
          throw Error();
        },
        never,
      )
    ).status,
    503,
  );
});

test('unconfigured connection is explicit and cannot dispatch', async () => {
  const result = await handleSoftwareRefresh(
    request(),
    { PUBLIC_TINA_CLIENT_ID: 'project' },
    { release: 'Dalmatian' },
    member,
  );
  assert.equal((await result.json()).configured, false);
  assert.equal(
    (await handleSoftwareRefresh(request('POST'), { PUBLIC_TINA_CLIENT_ID: 'project' }, {}, member))
      .status,
    503,
  );
});

test('dispatch capability fixes repository workflow and main; never exposes its credential', async () => {
  const calls = [];
  const fake = async (url, init) => {
    calls.push([url, init]);
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers.Authorization, 'Bearer server-only-secret');
    if (url.includes('/runs?')) return reply({ workflow_runs: [] });
    if (url.includes('/pulls?')) return reply([]);
    return new Response(null, { status: 204 });
  };
  const response = await handleSoftwareRefresh(request('POST'), env, {}, member, fake);
  assert.equal(response.status, 202);
  assert.match(
    calls[2][0],
    /OpenStackweb\/openstack.org-astro\/actions\/workflows\/software-refresh.yml\/dispatches$/,
  );
  assert.deepEqual(JSON.parse(calls[2][1].body), { ref: 'main' });
  assert.doesNotMatch(await response.text(), /server-only-secret/);
});

test('pending refresh PR or running workflow blocks duplicate dispatch', async () => {
  for (const pending of [true, false]) {
    let posts = 0;
    const fake = async (url, init) => {
      if (init.method === 'POST') posts++;
      return url.includes('/runs?')
        ? reply({ workflow_runs: pending ? [] : [{ status: 'queued' }] })
        : reply(
            pending
              ? [
                  {
                    number: 2,
                    head: {
                      repo: { full_name: 'OpenStackweb/openstack.org-astro' },
                      ref: 'software-refresh/1-1',
                    },
                  },
                ]
              : [],
          );
    };
    assert.equal((await handleSoftwareRefresh(request('POST'), env, {}, member, fake)).status, 409);
    assert.equal(posts, 0);
  }
});

test('upstream failure is sanitized and cannot dispatch', async () => {
  const response = await handleSoftwareRefresh(
    request('POST'),
    env,
    {},
    member,
    async () => new Response('sensitive upstream body', { status: 403 }),
  );
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /sensitive upstream body|server-only-secret/);
});

test('timestamp alone creates no catalogue change; candidate counts preserve history', () => {
  const result = {
    source: 'https://api.example.test',
    catalog: [{ components: [{ id: 1 }], subcategories: [] }],
    release: { id: 1, name: 'Dalmatian' },
    samples: [],
    history: [],
  };
  const previous = softwareCandidateFiles(result);
  assert.equal(prepareSoftwareRefresh(result, previous, '2026-09-27').changed.length, 0);
  const next = structuredClone(result);
  next.catalog[0].components.push({ id: 2 });
  const candidate = prepareSoftwareRefresh(next, previous);
  assert.deepEqual(candidate.changed, ['catalog.json']);
  assert.equal(candidate.summary.previousComponents, 1);
  assert.equal(candidate.summary.components, 2);
  assert.equal(previous['catalog.json'][0].components.length, 1);
});
