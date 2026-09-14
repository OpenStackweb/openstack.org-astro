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
