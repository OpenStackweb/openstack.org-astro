import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCompanyProfile } from '../../src/lib/server/company-profiles.mjs';

const profile = (description) =>
  prepareCompanyProfile(
    { name: 'Example', slug: 'example', sections: { description } },
    { pageTitle: 'Company Profile' },
  );

test('company metadata reads sanitized prose with entities and paragraph boundaries', () => {
  const company = profile(
    '<p>Cloud &amp; <strong>storage</strong>.</p><script>secret()</script><p>More.</p>',
  );
  assert.equal(company.description, 'Cloud & storage. More.');
  assert.match(company.sections[0].html, /<strong>storage<\/strong>/);
});

test('company metadata has an empty-copy fallback and bounds long excerpts', () => {
  assert.equal(profile('').description, 'Example · Company Profile');
  const excerpt = profile('A detailed description '.repeat(30)).description;
  assert.ok(excerpt.length <= 201);
  assert.ok(excerpt.endsWith('…'));
});
