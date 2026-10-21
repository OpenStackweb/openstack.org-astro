import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadMarketplaceCatalogue,
  MARKETPLACE_ORIGIN,
} from '../../src/lib/server/marketplace-catalogue.mjs';
const env = { MARKETPLACE_SERVICE_ORIGIN: MARKETPLACE_ORIGIN };
const row = {
  id: 11,
  name: 'Synthetic provider',
  slug: 'cloud',
  company: { id: 2, name: 'Synthetic', url_segment: 'synthetic' },
  overview: '<script>unsafe()</script><p>Public</p>',
};
const page = (records, current_page = 1, last_page = 1, total = records.length) =>
  new Response(JSON.stringify({ data: records, current_page, last_page, total }));
test('runtime reads only requested public category without visitor credentials', async () => {
  const calls = [];
  const result = await loadMarketplaceCatalogue(env, 'public-clouds', async (url, options) => {
    calls.push(url);
    assert.equal(url.origin, MARKETPLACE_ORIGIN);
    assert.deepEqual(Object.keys(options.headers).sort(), ['Accept', 'User-Agent']);
    assert.equal(options.redirect, 'error');
    return page([row]);
  });
  assert.equal(calls.length, 1);
  assert.equal(result.categories.find((c) => c.slug === 'public-clouds').records.length, 1);
  assert.equal(
    result.categories.find((c) => c.slug === 'public-clouds').records[0].descriptionHtml,
    '<p>Public</p>',
  );
  assert.equal(result.categories.find((c) => c.slug === 'training').records.length, 0);
});
test('backend failure and unapproved origin never serve stale fallback data', async () => {
  for (const response of [
    () => new Response('bad', { status: 503 }),
    () => page([], 1, 1, 2),
    () => new Response('{}'),
  ]) {
    await assert.rejects(loadMarketplaceCatalogue(env, 'public-clouds', async () => response()));
  }
  await assert.rejects(
    loadMarketplaceCatalogue(
      { MARKETPLACE_SERVICE_ORIGIN: 'https://evil.example' },
      'training',
      () => {
        throw Error('must not fetch');
      },
    ),
  );
});
test('runtime handles empty catalogue and paginated Drivers', async () => {
  const empty = await loadMarketplaceCatalogue(env, 'training', async () => page([]));
  assert.equal(empty.categories.find((c) => c.slug === 'training').records.length, 0);
  const loaded = await loadMarketplaceCatalogue(env, 'drivers', async (url) => {
    const p = Number(url.searchParams.get('page'));
    return page([{ id: p, name: `Driver ${p}`, slug: `driver-${p}` }], p, 2, 2);
  });
  assert.equal(loaded.categories.find((c) => c.slug === 'drivers').records.length, 2);
});
test('home uses category metadata without fetching business data', async () => {
  const loaded = await loadMarketplaceCatalogue(env, undefined, () => {
    throw Error('unexpected request');
  });
  assert.equal(loaded.categories.length, 7);
  assert.ok(loaded.categories.every((c) => c.records.length === 0));
});

test('staging backend cannot silently become a production deployment binding', async () => {
  await assert.rejects(
    loadMarketplaceCatalogue({ ...env, SITE_DEPLOYMENT: 'production' }, 'training'),
    /separate reviewed deployment/,
  );
});

test('missing backend binding fails closed', async () => {
  await assert.rejects(loadMarketplaceCatalogue({}, 'training'), /not configured/);
});
