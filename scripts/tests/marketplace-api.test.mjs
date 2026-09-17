import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCategory, projectRecord, categories, publicUrl } from '../marketplace-api.mjs';
const record = (id) => ({
  id,
  name: 'Cloud ' + id,
  slug: 'cloud-' + id,
  company: { name: 'Provider', url_segment: 'provider', logo: 'https://example.org/logo.png' },
  data_centers: [{ city: 'Zero', lat: 0, lng: 0 }],
  reviews: [{ author: { email: 'private@example.org' } }],
  access_token: 'not-public',
});
test('projection retains zero coordinates and excludes unneeded review and token data', () => {
  const p = projectRecord(record(1), categories[0]);
  assert.equal(p.locations[0].lat, 0);
  assert.equal(p.href, '/marketplace/public-clouds/provider/cloud-1/');
  assert.ok(!JSON.stringify(p).includes('private@example.org'));
  assert.ok(!JSON.stringify(p).includes('not-public'));
  assert.equal(publicUrl('javascript:alert(1)'), '');
  assert.equal(publicUrl('https://user:password@example.org/'), '');
});
test('pagination assembles full ordered catalogue', async () => {
  const pages = [];
  const data = await fetchCategory('https://example.org', categories[0], async (u) => {
    const p = Number(u.searchParams.get('page'));
    pages.push(p);
    return {
      ok: true,
      json: async () => ({ total: 2, current_page: p, last_page: 2, data: [record(p)] }),
    };
  });
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(
    data.records.map((r) => r.id),
    [1, 2],
  );
});
test('duplicate IDs, changing totals and incomplete catalogues fail closed', async () => {
  for (const mode of ['duplicate', 'changed', 'incomplete'])
    await assert.rejects(
      fetchCategory('https://example.org', categories[0], async (u) => {
        const p = Number(u.searchParams.get('page'));
        return {
          ok: true,
          json: async () => ({
            total: mode === 'changed' && p === 2 ? 3 : 2,
            current_page: p,
            last_page: 2,
            data: mode === 'incomplete' && p === 2 ? [] : [record(mode === 'duplicate' ? 1 : p)],
          }),
        };
      }),
    );
});
