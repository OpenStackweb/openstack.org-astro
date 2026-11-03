import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCompanyProfile } from '../../src/lib/server/company-profiles.mjs';
import labels from '../../src/lib/content/company-profile.json' with { type: 'json' };
const bindings = { MARKETPLACE_SERVICE_ORIGIN: 'https://marketplace-staging.openstack.org' };
test('published company profile uses service data and sanitizes HTML', async () => {
  const result = await loadCompanyProfile(
    'synthetic_company',
    labels,
    bindings,
    async (url, options) => {
      assert.equal(
        url,
        'https://marketplace-staging.openstack.org/api/public/v1/companies/synthetic_company',
      );
      assert.equal(options.redirect, 'manual');
      assert.equal(options.headers, undefined);
      return Response.json({
        slug: 'synthetic_company',
        name: 'Synthetic company',
        location: 'Austin, TX, US',
        description: '<p>Published description</p><script>alert(1)</script>',
        contact_email: '<img src=x>',
      });
    },
  );
  assert.equal(result.name, 'Synthetic company');
  assert.equal(result.location, 'Austin, TX, US');
  assert.ok(result.sections.some((section) => section.html.includes('Published description')));
  assert.ok(
    result.sections.every(
      (section) => !section.html.includes('<script>') && !section.html.includes('<img src=x>'),
    ),
  );
});
test('service errors cannot silently show an outdated imported profile', async () => {
  await assert.rejects(
    loadCompanyProfile('vexxhost', labels, bindings, async () => new Response('', { status: 503 })),
    /unavailable/,
  );
  await assert.rejects(
    loadCompanyProfile('vexxhost', labels, {
      MARKETPLACE_SERVICE_ORIGIN: 'https://attacker.invalid',
    }),
    /Unapproved/,
  );
});

test('production company profile uses the matching production service', async () => {
  const result = await loadCompanyProfile(
    'synthetic_company',
    labels,
    {
      SITE_DEPLOYMENT: 'production',
      MARKETPLACE_SERVICE_ORIGIN: 'https://marketplace.openstack.org',
    },
    async (url) => {
      assert.equal(new URL(url).origin, 'https://marketplace.openstack.org');
      return Response.json({ slug: 'synthetic_company', name: 'Synthetic company' });
    },
  );
  assert.equal(result.name, 'Synthetic company');
  await assert.rejects(
    loadCompanyProfile('synthetic_company', labels, { ...bindings, SITE_DEPLOYMENT: 'production' }),
    /Unapproved/,
  );
});
