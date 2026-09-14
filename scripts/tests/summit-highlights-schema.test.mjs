import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summitHighlightsField } from '../../tina/schema/summit-highlights.ts';

function covered(value, fields, path) {
  const definitions = new Map(fields.map(field => [field.name, field]));
  for (const [key, item] of Object.entries(value)) {
    const field = definitions.get(key);
    assert.ok(field, `${path}.${key} is absent from the editor schema`);
    if (field.type === 'object' && item != null) {
      for (const child of field.list ? item : [item]) covered(child, field.fields, `${path}.${key}`);
    }
  }
}

test('Summit highlights editor preserves every field in all four imported archives', () => {
  for (const event of ['barcelona-2016', 'boston-2017', 'sydney-2017', 'vancouver-2018']) {
    const page = JSON.parse(readFileSync(new URL(`../../src/lib/content/pages/summit-${event}.json`, import.meta.url)));
    covered(page.highlights, summitHighlightsField.fields, event);
  }
});
