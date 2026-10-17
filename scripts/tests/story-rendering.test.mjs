import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkStoryRendering } from '../lib/story-rendering.mjs';

const catalogue = [{ id: 1 }, { id: 2 }, { id: 3 }];
const html = ids => ids.map(id => `<article data-story='${JSON.stringify({ id })}'></article>`).join('');

test('matches exact visible identities while respecting CMS exclusions', () => {
  assert.deepEqual(checkStoryRendering(html([3, 1]), catalogue, ['2']),
    { visibleCount: 2, renderedCount: 2, hiddenCount: 1 });
});
test('a duplicated card cannot conceal a missing story at the same count', () => {
  assert.throws(() => checkStoryRendering(html([1, 1, 3]), catalogue), /exactly once/);
});
test('hidden cards cannot replace visible cards at the same count', () => {
  assert.throws(() => checkStoryRendering(html([1, 2]), catalogue, ['2']), /exactly once/);
});
test('missing cards and malformed payloads are rejected', () => {
  assert.throws(() => checkStoryRendering(html([1]), catalogue), /exactly once/);
  assert.throws(() => checkStoryRendering('<article data-story="invalid"></article>', catalogue));
  assert.throws(() => checkStoryRendering('<article data-story="{}"></article>', catalogue), /ID is required/);
});
