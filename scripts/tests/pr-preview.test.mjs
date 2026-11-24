import test from 'node:test';
import assert from 'node:assert/strict';
import { handleEditorialPreview } from '../../src/lib/server/editorial-preview-request.mjs';
import {
  assessPreviewPull,
  previewContentPath,
  previewRepository,
  pullPreviewBranch,
} from '../../src/lib/server/pr-preview-policy.mjs';
const head = 'a'.repeat(40),
  base = 'b'.repeat(40);
const pull = {
  state: 'open',
  changed_files: 1,
  title: 'Community update',
  head: { sha: head, label: 'contributor:topic' },
  base: { ref: 'main', repo: { full_name: previewRepository } },
};
const files = [{ filename: 'src/lib/content/community.json' }];
const env = {
  PUBLIC_TINA_CLIENT_ID: 'project',
  EDITORIAL_GITHUB_TOKEN: 'reader',
  SOFTWARE_REFRESH_GITHUB_TOKEN: 'writer',
};
const member = async () => ({ verified: true, enabled: true });
function request(method = 'GET', query = '', origin = 'https://www.openstack.org') {
  return new Request(`https://www.openstack.org/api/cms/editorial-preview?pr=57${query}`, {
    method,
    headers: { origin, authorization: 'Bearer editor' },
  });
}
function mock(options = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, ...init });
    assert.equal(init.redirect, 'manual');
    if (url.includes('/actions/')) {
      assert.equal(init.headers.Authorization, 'Bearer writer');
      return url.endsWith('/dispatches')
        ? new Response(null, { status: 204 })
        : Response.json({ workflow_runs: options.active ? [{ status: 'queued' }] : [] });
    }
    assert.equal(init.headers.Authorization, 'Bearer reader');
    if (url.includes('/files?')) return Response.json(options.files || files);
    if (url.endsWith('/pulls/57')) return Response.json(options.pull || pull);
    if (url.endsWith('/commits/main')) return Response.json({ sha: base });
    return new Response(null, { status: 404 });
  };
  return { calls, fetch };
}
test('fork policy allows content data, rejects incomplete listings, code, renames and closed PRs', () => {
  assert.equal(assessPreviewPull(pull, files), null);
  for (const path of [
    'package.json',
    '.github/workflows/build.yml',
    'src/lib/content/../../server/attack.json',
    'src/lib/content/data.js',
    'src/lib/server/handler.mjs',
  ])
    assert.equal(previewContentPath(path), false);
  for (const [p, f] of [
    [{ ...pull, state: 'closed' }, files],
    [pull, []],
    [pull, [{ filename: 'package.json' }]],
    [pull, [{ ...files[0], previous_filename: 'package.json' }]],
  ])
    assert.ok(assessPreviewPull(p, f));
});
test('inspection is read-only and returns a deterministic source-and-base preview identity', async () => {
  const api = mock();
  const response = await handleEditorialPreview(request(), env, member, api.fetch);
  const info = await response.json();
  assert.equal(response.status, 200);
  assert.equal(info.state, 'not_requested');
  assert.equal(info.branch, pullPreviewBranch(57, head, base));
  assert.ok(api.calls.every((call) => call.method !== 'POST'));
});
test('explicit request dispatches only trusted main workflow with server-verified revisions', async () => {
  const api = mock();
  const response = await handleEditorialPreview(
    request('POST', `&head=${head}&base=${base}`),
    env,
    member,
    api.fetch,
  );
  assert.equal(response.status, 202);
  const dispatched = api.calls.at(-1);
  assert.ok(dispatched.url.endsWith('/actions/workflows/prepare-pr-preview.yml/dispatches'));
  assert.deepEqual(JSON.parse(dispatched.body), { ref: 'main', inputs: { pr: '57', head, base } });
});
test('stale inspections, code changes, active preparation and cross-origin POST never dispatch', async () => {
  for (const [req, options, status] of [
    [request('POST', `&head=${'c'.repeat(40)}&base=${base}`), {}, 409],
    [request('POST', `&head=${head}&base=${base}`), { files: [{ filename: 'package.json' }] }, 409],
    [request('POST', `&head=${head}&base=${base}`), { active: true }, 409],
    [request('POST', '', 'https://evil.test'), {}, 403],
  ]) {
    const api = mock(options);
    assert.equal((await handleEditorialPreview(req, env, member, api.fetch)).status, status);
    assert.ok(api.calls.every((call) => call.method !== 'POST'));
  }
});
test('disabled Tina users cannot even inspect private PR details', async () => {
  const api = mock();
  const result = await handleEditorialPreview(
    request(),
    env,
    async () => ({ verified: true, enabled: false }),
    api.fetch,
  );
  assert.equal(result.status, 403);
  assert.equal(api.calls.length, 0);
});
