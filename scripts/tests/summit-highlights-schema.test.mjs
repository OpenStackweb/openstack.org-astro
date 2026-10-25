import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summitHighlightsField } from '../../tina/schema/summit-highlights.ts';

function covered(value, fields, path) {
  const definitions = new Map(fields.map((field) => [field.name, field]));
  for (const [key, item] of Object.entries(value)) {
    const field = definitions.get(key);
    assert.ok(field, `${path}.${key} is absent from the editor schema`);
    if (field.type === 'object' && item != null) {
      for (const child of field.list ? item : [item])
        covered(child, field.fields, `${path}.${key}`);
    }
  }
}

test('Summit highlights editor preserves every field in all four imported archives', () => {
  for (const event of ['barcelona-2016', 'boston-2017', 'sydney-2017', 'vancouver-2018']) {
    const page = JSON.parse(
      readFileSync(new URL(`../../src/lib/content/pages/summit-${event}.json`, import.meta.url)),
    );
    covered(page.highlights, summitHighlightsField.fields, event);
  }
});

const { prepareHighlights } = await import('../../src/lib/server/summit-highlights.mjs');
test('published statistics reject incomplete rows while retaining formatted historical values', () => {
  for (const row of [
    {},
    { label: 'Attendees' },
    { label: ' ', value: '5,000+' },
    { label: 'Attendees', value: ' ' },
  ]) {
    assert.throws(
      () => prepareHighlights({ statistics: [row] }, (value) => value),
      /label and a published value/,
    );
  }
  const statistics = [
    { label: 'Attendees', value: '5,000+' },
    { label: 'Cancelled sessions', value: '0' },
  ];
  assert.deepEqual(prepareHighlights({ statistics }, (value) => value).statistics, statistics);
  assert.deepEqual(prepareHighlights({ statistics: [] }, (value) => value).statistics, []);
});
test('incomplete highlights drafts stay renderable without changing the saved document', () => {
  const draft = {
    hero: null,
    statistics: [null, {}],
    videos: [null, {}, { youtubeId: 'fY4nLcMuoJg', title: 'Video' }],
    photos: [{ image: 'javascript:bad' }],
    promotion: { url: 'javascript:bad' },
  };
  const original = structuredClone(draft);
  const result = prepareHighlights(draft, (value) => value, { draft: true });
  assert.deepEqual(draft, original);
  assert.equal(result.videos.length, 1);
  assert.equal(result.photos[0].image, '');
  assert.equal(result.promotion.url, '');
  assert.deepEqual(result.statistics, [{ label: '', value: '' }]);
  assert.throws(() => prepareHighlights({ videos: [{}] }, (value) => value));
});
test('highlights accept CMS raster media but reject documents and unsafe image paths', () => {
  const image = `/cms-media/${'a'.repeat(64)}.png`;
  assert.equal(prepareHighlights({ hero: { image } }, (value) => value).hero.image, image);
  for (const invalid of [
    image.replace('.png', '.pdf'),
    '/cms-media/../image.png',
    'https://external.example/image.png',
  ]) {
    assert.throws(() => prepareHighlights({ hero: { image: invalid } }, (value) => value));
  }
});
