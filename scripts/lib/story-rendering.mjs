import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

/** Compare identities, so one duplicated card cannot conceal a missing story. */
export function checkStoryRendering(html, catalogue, hiddenIds = []) {
  const expected = catalogue.filter(story => !hiddenIds.includes(String(story.id)))
    .map(story => String(story.id)).sort();
  assert.equal(new Set(expected).size, expected.length, 'Source story IDs must be unique');
  const elements = DomUtils.findAll(el => el.name === 'article' && 'data-story' in el.attribs,
    parseDocument(html).children);
  const rendered = elements.map(el => {
    const story = JSON.parse(el.attribs['data-story']);
    assert.ok(story.id !== undefined && story.id !== null, 'Rendered story ID is required');
    return String(story.id);
  }).sort();
  assert.deepEqual(rendered, expected, 'Render every visible CMS-selected story exactly once');
  return { visibleCount: expected.length, renderedCount: rendered.length,
    hiddenCount: catalogue.length - expected.length };
}
