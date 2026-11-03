import test from 'node:test';
import assert from 'node:assert/strict';
import { pageRobots, robotsText } from '../../src/lib/indexing.mjs';
const enabled = { SITE_DEPLOYMENT: 'production', SITE_INDEXING_ENABLED: 'true' };
test('indexing needs explicit launch flag and exact public production origin', () => {
  for (const origin of [
    'https://astro.openstack.org',
    'https://preview.workers.dev',
    'http://www.openstack.org',
  ]) {
    assert.equal(pageRobots(new URL('/', origin), enabled), 'noindex, nofollow');
    assert.match(robotsText(new URL('/', origin), enabled), /Disallow: \/\n/);
  }
  const url = new URL('https://www.openstack.org/software/');
  assert.equal(pageRobots(url, {}), 'noindex, nofollow');
  assert.equal(pageRobots(url, { SITE_DEPLOYMENT: 'production' }), 'noindex, nofollow');
  assert.equal(pageRobots(url, enabled), 'index, follow');
  assert.equal(pageRobots(url, enabled, 404), 'noindex, nofollow');
});
test('private workflows stay excluded when public pages are indexable', () => {
  for (const path of [
    '/auth/callback',
    '/admin/',
    '/api/cms/media',
    '/profile/',
    '/marketplaceadmin/',
    '/review/branch',
    '/cms-preview/navigation',
    '/tina-island/site',
    '/search',
    '/user-survey/staff/',
    '/user-survey/service/responses',
  ]) {
    assert.equal(
      pageRobots(new URL(path, 'https://www.openstack.org'), enabled),
      'noindex, nofollow',
      path,
    );
  }
  for (const path of ['/', '/marketplace/', '/software/', '/user-survey/']) {
    assert.equal(
      pageRobots(new URL(path, 'https://www.openstack.org'), enabled),
      'index, follow',
      path,
    );
  }
  assert.match(robotsText(new URL('https://www.openstack.org/robots.txt'), enabled), /Allow: \/\n/);
});
