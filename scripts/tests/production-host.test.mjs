import test from 'node:test';
import assert from 'node:assert/strict';
import { productionHostRedirect } from '../../src/lib/server/production-host.mjs';

test('production apex preserves survey entry and login return paths on callback host', () => {
  for (const path of [
    '/user-survey/?entry=annual',
    '/user-survey/service/auth/login?next=%2Fstaff',
    '/blog/example/?page=2',
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
