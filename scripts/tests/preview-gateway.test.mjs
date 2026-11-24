import test from 'node:test';
import assert from 'node:assert/strict';
import { previewGateway } from '../../workers/editorial-preview/index.mjs';
const origin = 'https://22ba6a73-preview.openstack.org';
const token = 'header.payload.signature';
const request = (path = '/', options = {}) =>
  new Request(origin + path, {
    ...options,
    headers: { 'Cf-Access-Jwt-Assertion': token, ...options.headers },
  });
test('pins preview origin and forwards only Access assertion, never production credentials', async () => {
  const response = await previewGateway(
    request('/community/?a=1', {
      headers: {
        Cookie: 'session=secret; CF_Authorization=other',
        Authorization: 'Bearer secret',
        'CF-Access-Client-Secret': 'secret',
      },
    }),
    async (url, init) => {
      assert.equal(
        url.href,
        'https://22ba6a73-openstack-org-astro-editorial.openstack-review.workers.dev/community/?a=1',
      );
      assert.equal(init.redirect, 'manual');
      assert.equal(init.headers.get('Cookie'), `CF_Authorization=${token}`);
      assert.equal(init.headers.get('Authorization'), null);
      assert.equal(init.headers.get('CF-Access-Client-Secret'), null);
      return new Response('preview', {
        headers: { 'Set-Cookie': 'session=origin', 'Cache-Control': 'public' },
      });
    },
  );
  assert.equal(await response.text(), 'preview');
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});
test('rejects unknown hosts, missing sessions and writes before fetching', async () => {
  const fail = () => {
    throw Error('unexpected fetch');
  };
  for (const req of [
    new Request('https://evil.example/'),
    new Request(origin),
    request('/', { method: 'POST' }),
    request('/admin/'),
  ]) {
    assert.ok((await previewGateway(req, fail)).status >= 400);
  }
});
test('keeps origin redirects on custom hostname and refuses Access redirect leakage', async () => {
  const response = await previewGateway(request(), async () =>
    Response.redirect(
      'https://22ba6a73-openstack-org-astro-editorial.openstack-review.workers.dev/community/',
      302,
    ),
  );
  assert.equal(response.headers.get('location'), origin + '/community/');
  const blocked = await previewGateway(request(), async () =>
    Response.redirect('https://calm-wind-c20f.cloudflareaccess.com/cdn-cgi/access/login/', 302),
  );
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get('location'), null);
});
