import test from 'node:test';
import assert from 'node:assert/strict';
import { redirectLocation } from '../../src/lib/server/redirect-location.mjs';

test('paper redirects preserve language but discard unrelated query parameters', () => {
  assert.equal(redirectLocation({ to: '/paper/', preserveQuery: ['lang'] },
    'https://astro.openstack.org/old/?lang=ja_JP&utm_source=test'), '/paper/?lang=ja_JP');
});
test('existing full-query rules retain repeated parameters; ordinary redirects remain unchanged', () => {
  const request = 'https://astro.openstack.org/old/?lang=ja_JP&tag=a&tag=b';
  assert.equal(redirectLocation({ to: '/paper/', preserveQuery: true }, request), '/paper/?lang=ja_JP&tag=a&tag=b');
  assert.equal(redirectLocation({ to: 'https://openinfra.org/about/' }, request), 'https://openinfra.org/about/');
});

test('annual Survey entry escapes a cached legacy root redirect without forwarding auth parameters', async () => {
  const { readFile } = await import('node:fs/promises');
  const rules = JSON.parse(await readFile(new URL('../../src/lib/content/redirects.json', import.meta.url)));
  assert.equal(rules.some(row => row.from === '/user-survey/'), false);
  const annual = rules.find(row => row.from === '/user-survey/survey-2026/');
  assert.equal(annual.status, 302);
  const location = redirectLocation(annual, 'https://astro.openstack.org/user-survey/survey-2026/?code=private&state=private');
  assert.equal(location, '/user-survey/?entry=annual');
  assert.notEqual(location, '/user-survey/');
});
