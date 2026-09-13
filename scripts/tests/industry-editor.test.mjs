import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { prepareEditorialPage } from '../../src/lib/server/editorial.mjs';
const directory = new URL('../../src/lib/content/pages/', import.meta.url);
const lock = JSON.parse(readFileSync(new URL('../../tina/tina-lock.json', import.meta.url), 'utf8'));
const fields = lock.schema.collections.find(c => c.name === 'editorial').fields;
function tinaValues(value, schema) {
  return Object.fromEntries(schema.map(field => {
    const item = value[field.name];
    return [field.name, item == null ? null : field.type === 'object'
      ? field.list ? item.map(child => tinaValues(child, field.fields)) : tinaValues(item, field.fields)
      : item];
  }));
}
test('All industry pages render identically when Tina returns null for unset optional fields', () => {
  let count = 0;
  for (const file of readdirSync(directory)) {
    const content = JSON.parse(readFileSync(new URL(file, directory), 'utf8'));
    if (!content.industry) continue;
    assert.deepEqual(prepareEditorialPage(tinaValues(content, fields)), prepareEditorialPage(content), file);
    count++;
  }
  assert.equal(count, 11);
});
test('Industry draft edits, section ordering and Science downloads reach the page model', () => {
  const content = JSON.parse(readFileSync(new URL('use-cases-science.json', directory), 'utf8'));
  const original = prepareEditorialPage(content);
  const draft = structuredClone(content);
  draft.scienceBook.bookUrl = '/assets/review-book.pdf';
  draft.industry.sections.reverse();
  draft.industry.sections[0].title = 'Editorial draft title';
  const rendered = prepareEditorialPage(draft);
  assert.equal(rendered.scienceBook.bookUrl, '/assets/review-book.pdf');
  assert.deepEqual(rendered.industry.sections.map(s => s.id), original.industry.sections.map(s => s.id).reverse());
  assert.equal(rendered.industry.sections[0].title, 'Editorial draft title');
  assert.deepEqual(prepareEditorialPage(content), original);
});
