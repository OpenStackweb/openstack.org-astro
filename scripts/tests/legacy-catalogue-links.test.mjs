import assert from 'node:assert/strict';
import test from 'node:test';
import redirects from '../../src/lib/content/redirects.json' with { type: 'json' };
import catalog from '../../src/lib/marketplace/catalog.json' with { type: 'json' };
import { reviewStatusFor } from '../../src/lib/review-status.mjs';

test('verified legacy training aliases resolve to the same provider in the service snapshot', () => {
  const records = catalog.categories.find((category) => category.slug === 'training').records;
  for (const provider of [
    'canonical/57',
    'city-network/695',
    'cloudification/1308',
    'easystack/506',
    'stackhpc/1135',
    'valencia-college/1311',
  ]) {
    const alias = redirects.find((row) => row.from === `/marketplace/training/${provider}/`);
    assert.ok(alias, provider);
    assert.equal(
      alias.status,
      302,
      'Data reconciliation is pending; do not make this permanent yet',
    );
    assert.equal(alias.preserveQuery, false);
    assert.ok(
      records.some((record) => record.href.replace(/\/$/, '') === alias.to.replace(/\/$/, '')),
      alias.to,
    );
    assert.ok(alias.to.startsWith(`/marketplace/training/${provider.split('/')[0]}/`));
  }
});

test('missing catalogue data and broken historical destinations have distinct notices', () => {
  for (const path of [
    '/marketplace/training/mirantis/105/',
    '/marketplace/training/red-hat/227/',
  ]) {
    const notice = reviewStatusFor(path);
    assert.equal(notice.status, 'Production catalogue data pending');
    assert.equal(notice.production, `https://www.openstack.org${path}`);
  }
  for (const path of [
    '/marketplace/consulting/Solinea/solinea-consulting/',
    '/marketplace/training/null/1265/',
    '/user-stories/best-buy/',
  ]) {
    const notice = reviewStatusFor(path);
    assert.equal(notice.status, 'Historical destination unavailable');
    assert.equal(notice.production, undefined, 'Do not recommend a known broken destination');
  }
  assert.equal(reviewStatusFor('/marketplace/training/unknown-provider/987654321/'), null);
});
