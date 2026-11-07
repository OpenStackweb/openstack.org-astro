import test from 'node:test';
import assert from 'node:assert/strict';
import { productionHostRedirect } from '../../src/lib/server/production-host.mjs';

test('production apex preserves survey entry and login return paths on callback host', () => {
  for (const path of [
    '/user-survey/?entry=annual',
    '/user-survey/service/auth/login?next=%2Fstaff',
    '/blog/example/?page=2',
    '/admin/',
    '/admin/index.html?branch=main',
    '/admin/bridge.js',
  ]) {
    const response = productionHostRedirect(new Request(`https://openstack.org${path}`), {
      SITE_DEPLOYMENT: 'production',
    });
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('Location'), `https://www.openstack.org${path}`);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
});
test('canonical, review and unrelated hosts do not redirect', () => {
  for (const [host, deployment] of [
    ['www.openstack.org', 'production'],
    ['astro.openstack.org', 'review'],
    ['openstack.org', 'review'],
    ['localhost', 'production'],
  ]) {
    assert.equal(
      productionHostRedirect(new Request(`https://${host}/user-survey/`), {
        SITE_DEPLOYMENT: deployment,
      }),
      null,
    );
  }
});

import { adminAssetResponse } from '../../src/lib/server/admin-assets.mjs';
test('CMS shell and assets use static binding; unrelated routes keep normal handling', async () => {
  const seen = [];
  const env = { ASSETS: { fetch: async (request) => {
    seen.push(request.url);
    return new Response('static asset');
  } } };
  for (const path of ['/admin', '/admin/', '/admin/index.html', '/admin/bridge.js']) {
    const request = new Request(`https://www.openstack.org${path}`);
    assert.equal(await (await adminAssetResponse(request, env)).text(), 'static asset');
    assert.equal(seen.at(-1), request.url);
  }
  for (const path of ['/', '/administrator', '/blog/', '/auth/login']) {
    assert.equal(adminAssetResponse(new Request(`https://www.openstack.org${path}`), env), null);
  }
  assert.equal(seen.length, 4);
});
