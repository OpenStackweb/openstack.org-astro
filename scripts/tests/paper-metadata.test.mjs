import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { preparePaper } from '../../src/lib/server/papers.mjs';
const read = name => JSON.parse(readFileSync(new URL(`../../src/lib/content/papers/${name}.json`, import.meta.url)));
test('Paper metadata is independent of the visible subtitle and retains older fallback', () => {
  const source = read('3045-en-us');
  assert.equal(preparePaper(source).description, source.subtitle);
  const edited = preparePaper({ ...source, description: 'Editorial search description.' });
  assert.equal(edited.description, 'Editorial search description.');
  assert.equal(edited.subtitle, source.subtitle);
  assert.throws(() => preparePaper({ ...source, description: { unexpected: true } }), /Invalid paper text/);
});
test('Translated edge papers preserve locale and local description', () => {
  for (const locale of ['en-us', 'de-de', 'id-id', 'ja-jp', 'ko-kr']) {
    const source = read(`3046-${locale}`);
    const result = preparePaper(source);
    assert.equal(result.locale, source.locale);
    assert.equal(result.description, source.description);
    assert.ok(result.description.trim());
    assert.equal(result.subtitle, '');
  }
});
