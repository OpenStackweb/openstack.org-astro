import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEditorialPreview } from '../../src/lib/server/editorial-preview-request.mjs';
const origin = 'https://www.openstack.org';
const sha = 'a'.repeat(40);
const env = { PUBLIC_TINA_CLIENT_ID: 'project', EDITORIAL_PREVIEW_DISPATCH_TOKEN: 'server-secret' };
const member = async () => ({ verified: true, enabled: true });
const req = (method = 'GET', branch = 'community-updates', headers = {}) =>
  new Request(`${origin}/api/cms/editorial-preview?branch=${encodeURIComponent(branch)}`, {
    method,
    headers: { authorization: 'Bearer editor', origin, ...headers },
  });
function github({ state, active = false, missing = false, failDispatch = false } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (url, init) => {
      calls.push({ url, ...init });
      if (url.endsWith('/dispatches'))
        return new Response(null, { status: failDispatch ? 403 : 204 });
      if (url.includes('/runs?'))
        return Response.json({ workflow_runs: active ? [{ status: 'queued' }] : [] });
      if (url.endsWith('/status'))
        return Response.json({
          sha,
          statuses: state
            ? [
                {
                  context: 'OpenStack editorial preview',
                  state,
                  target_url:
                    'https://12345678-openstack-org-astro-editorial.openstack-review.workers.dev',
                },
              ]
            : [],
        });
      return missing ? new Response(null, { status: 404 }) : Response.json({ sha });
    },
  };
}
test('checking status never dispatches; explicit action pins current server-resolved SHA on main', async () => {
  const mock = github();
  assert.equal((await handleEditorialPreview(req(), env, member, mock.fetch)).status, 200);
  assert.ok(mock.calls.every((c) => c.method !== 'POST'));
  const response = await handleEditorialPreview(
    req('POST', 'editorial/example'),
    env,
    member,
    mock.fetch,
  );
  assert.equal(response.status, 202);
  const dispatch = mock.calls.at(-1);
  assert.equal(
    dispatch.url,
    'https://api.github.com/repos/OpenStackweb/openstack.org-astro/actions/workflows/editorial-preview.yml/dispatches',
  );
  assert.deepEqual(JSON.parse(dispatch.body), {
    ref: 'main',
    inputs: { branch: 'editorial/example', revision: sha },
  });
  assert.equal(dispatch.redirect, 'manual');
  assert.doesNotMatch(await response.text(), /server-secret/);
});
test('rejects unauthorized, disabled and cross-origin requests before GitHub access', async () => {
  const never = () => {
    throw Error('must not contact GitHub');
  };
  assert.equal(
    (
      await handleEditorialPreview(
        req('POST', 'topic', { origin: 'https://evil.test' }),
        env,
        member,
        never,
      )
    ).status,
    403,
  );
  assert.equal(
    (await handleEditorialPreview(req('POST', 'topic', { authorization: '' }), env, member, never))
      .status,
    401,
  );
  assert.equal(
    (
      await handleEditorialPreview(
        req(),
        env,
        async () => ({ verified: true, enabled: false }),
        never,
      )
    ).status,
    403,
  );
  assert.equal(
    (await handleEditorialPreview(req('POST', '../evil'), env, member, never)).status,
    400,
  );
  assert.equal((await handleEditorialPreview(req('DELETE'), env, member, never)).status, 405);
});
test('main, missing branches and unavailable credentials cannot dispatch', async () => {
  for (const [request, config, mock, expected] of [
    [req('POST', 'main'), env, github(), 400],
    [req('POST'), env, github({ missing: true }), 409],
    [req('POST'), { PUBLIC_TINA_CLIENT_ID: 'project' }, github(), 503],
  ]) {
    assert.equal(
      (await handleEditorialPreview(request, config, member, mock.fetch)).status,
      expected,
    );
    assert.ok(mock.calls.every((c) => c.method !== 'POST'));
  }
});
test('existing current preview is reused and active builds block another request', async () => {
  for (const [options, expected] of [
    [{ state: 'success' }, 200],
    [{ active: true }, 409],
  ]) {
    const mock = github(options);
    assert.equal(
      (await handleEditorialPreview(req('POST'), env, member, mock.fetch)).status,
      expected,
    );
    assert.ok(mock.calls.every((c) => c.method !== 'POST'));
  }
});
test('failed builds can retry; dispatch errors are explicit without leaking credentials', async () => {
  assert.equal(
    (await handleEditorialPreview(req('POST'), env, member, github({ state: 'failure' }).fetch))
      .status,
    202,
  );
  const response = await handleEditorialPreview(
    req('POST'),
    env,
    member,
    github({ failDispatch: true }).fetch,
  );
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /server-secret/);
});

test('existing read-only status and workflow-dispatch credentials can be reused separately', async () => {
  const mock = github();
  const response = await handleEditorialPreview(
    req('POST'),
    {
      PUBLIC_TINA_CLIENT_ID: 'project',
      EDITORIAL_GITHUB_TOKEN: 'read-only',
      SOFTWARE_REFRESH_GITHUB_TOKEN: 'actions-only',
    },
    member,
    mock.fetch,
  );
  assert.equal(response.status, 202);
  for (const call of mock.calls) {
    assert.equal(
      call.headers.Authorization,
      call.url.includes('/actions/') ? 'Bearer actions-only' : 'Bearer read-only',
    );
  }
});
