import test from 'node:test';
import assert from 'node:assert/strict';
import { independentFetch } from '../../src/lib/network/upstream.mjs';
import { retainedApplicationLink } from '../../src/lib/retired-website.mjs';
import { categories, fetchCategory } from '../../src/lib/marketplace/public-api.mjs';
import { loadMemberProfile } from '../../src/lib/auth/member-profile.mjs';

test('legacy origin requests are rejected before reaching an upstream or transmitting credentials', async () => {
  let calls = 0;
  const fetcher = () => {
    calls++;
    throw Error('must not reach network');
  };
  for (const host of [
    'www.openstack.org',
    'openstack.org',
    'legacy.openstack.org',
    'beta.openstack.org',
    'WWW.OPENSTACK.ORG.',
  ]) {
    assert.throws(
      () =>
        independentFetch(
          `https://${host}/api/v1/members/me`,
          { headers: { Authorization: 'Bearer synthetic' } },
          fetcher,
        ),
      /retired website/,
    );
  }
  await assert.rejects(
    fetchCategory('https://www.openstack.org', categories[0], fetcher),
    /retired website/,
  );
  const session = { epoch: () => 1, current: () => ({ accessToken: 'synthetic' }) };
  await assert.rejects(
    loadMemberProfile({
      session,
      accessToken: async () => 'synthetic',
      clearSession() {
        throw Error('must not clear session');
      },
      endpoint: 'https://www.openstack.org/api/v1/members/me',
      fetchProfile: fetcher,
    }),
    /retired website/,
  );
  assert.equal(calls, 0);
});
test('independent services retain request semantics with redirects stopped at the first response', async () => {
  for (const host of [
    'oifapi.openinfra.dev',
    'search.openstack.org',
    'id.openinfra.dev',
    'marketplace-staging.openstack.org',
    'survey-staging.openstack.org',
    'api.github.com',
    'www.googleapis.com',
  ]) {
    const response = await independentFetch(
      `https://${host}/synthetic`,
      { method: 'POST', body: 'synthetic', headers: { Accept: 'application/json' } },
      async (_url, options) => {
        assert.equal(options.redirect, 'manual');
        assert.equal(options.method, 'POST');
        assert.equal(options.body, 'synthetic');
        return new Response(null, {
          status: 302,
          headers: { Location: 'https://www.openstack.org/Security/login' },
        });
      },
    );
    assert.equal(response.status, 302);
  }
});
test('migration notices keep independent applications and remove legacy website fallbacks', () => {
  for (const path of [
    '/profile/',
    '/brand/logo-request/',
    '/community/members/',
    '/user-survey/',
    '/Security/login/',
  ])
    assert.equal(retainedApplicationLink('https://www.openstack.org' + path), null);
  assert.equal(retainedApplicationLink('https://beta.openstack.org/profile/'), null);
  assert.equal(
    retainedApplicationLink('https://www.openstack.org/blog/'),
    'https://www.openstack.org/blog/',
  );
  assert.equal(
    retainedApplicationLink('https://docs.openstack.org/'),
    'https://docs.openstack.org/',
  );
  assert.equal(retainedApplicationLink('javascript:alert(1)'), null);
});

test('archived first-party links stay on Astro even when the destination is unavailable', async () => {
  const { reviewHref } = await import('../../src/lib/legacy-routes.js');
  assert.equal(
    reviewHref('https://www.openstack.org/archived-unavailable/?lang=en#section'),
    '/archived-unavailable/?lang=en#section',
  );
  assert.equal(
    reviewHref('https://www.openstack.org/blog/article/'),
    'https://www.openstack.org/blog/article/',
  );
});
