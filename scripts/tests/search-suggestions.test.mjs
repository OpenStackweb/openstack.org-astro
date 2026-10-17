import test from 'node:test';
import assert from 'node:assert/strict';
import { publicSuggestions, suggestSite, searchSite } from '../../src/lib/server/site-search.mjs';

test('suggestions preserve local navigation and sanitize upstream markup and destinations', () => {
  assert.deepEqual(publicSuggestions({ results: [
    { term: '<b>Nova</b> &amp; compute', payload: 'https://www.openstack.org/software/' },
    { term: 'Duplicate', payload: 'https://www.openstack.org/software/' },
    { term: 'Unsafe', payload: 'javascript:alert(1)' },
    { term: 'Credentialed', payload: 'https://user:secret@example.org/' },
    null,
    { term: '', payload: 'https://example.org/' },
  ] }), [{ title: 'Nova & compute', url: '/software/' }]);
  assert.throws(() => publicSuggestions({ results: new Array(101) }));
  assert.throws(() => publicSuggestions({ results: null }));
  assert.equal(publicSuggestions({ results: Array.from({ length: 10 }, (_, n) => ({ term: `Page ${n}`, payload: `https://www.openstack.org/page-${n}/` })) }).length, 6);
});

test('suggestions encode queries and never forward cookies or follow upstream redirects', async () => {
  const rows = await suggestSite('cloud & nova', async (url, options) => {
    assert.equal(url, 'https://search.openstack.org/api/public/v1/suggestions/www-openstack/cloud%20%26%20nova');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'manual');
    return Response.json({ results: [{ term: 'Cloud', payload: 'https://www.openstack.org/use-cases/' }] });
  });
  assert.equal(rows[0].url, '/use-cases/');
  await assert.rejects(suggestSite('nova', async () => new Response('', { status: 302 })));
  await assert.rejects(suggestSite('nova', async () => new Response('not JSON')));
  await assert.rejects(suggestSite('nova', async () => new Response('x'.repeat(2_000_001), { headers: { 'content-type': 'application/json' } })));
});

test('shared bounded JSON reader preserves full search results', async () => {
  const result = await searchSite('nova', 2, async (url) => {
    assert.ok(url.endsWith('/nova?page=2&page_size=10'));
    return Response.json({ qty: 1, results: [{ title: 'Nova', url: 'https://www.openstack.org/software/', content: 'Compute' }] });
  });
  assert.deepEqual(result, { total: 1, results: [{ title: 'Nova', url: '/software/', description: 'Compute' }] });
});
