import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

// Read-only preview check: transient preview overlays, never a CMS save.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4530';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const elements = (html) =>
  DomUtils.findAll((node) => node.type === 'tag', parseDocument(html).children);
async function render(data, prime = false) {
  const response = await fetch(`${base}/tina-island/marketing`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-tina-preview+json',
      ...(prime ? { 'X-Tina-Prime': '1' } : {}),
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return elements(await response.text());
}
function cards(nodes) {
  const events = nodes.find((node) => node.name === 'section' && node.attribs.id === 'events');
  assert.ok(events, 'Events section renders');
  return DomUtils.findAll((node) => node.name === 'article', events.children);
}
const original = await render({}, true);
const form = JSON.parse(
  original.find((node) => node.attribs['data-tina-form'])?.attribs['data-tina-form'] || 'null',
);
assert.ok(form?.id && form.data?.marketing, 'Use the actual Marketing query identity');
const baseline = cards(original);
assert.equal(baseline.length, 3);
const draft = structuredClone(form.data);
const events = draft.marketing.sections.find((section) => section.id === 'events');
events.cards.push({ title: 'Title-only draft <card>' });
let result = cards(await render({ [form.id]: draft }));
assert.equal(result.length, 4);
assert.equal(
  DomUtils.textContent(DomUtils.findOne((node) => node.name === 'h2', result[3].children)),
  'Title-only draft <card>',
);
assert.ok(result[3].attribs.id.startsWith('events-draft-'));
assert.equal(events.cards[3].id, undefined, 'Rendering cannot write fallback IDs into the draft');
events.cards[3].id = 'acceptance-card';
result = cards(await render({ [form.id]: draft }));
assert.equal(result[3].attribs.id, 'events-acceptance-card');
events.cards = [events.cards[3], ...events.cards.slice(0, 3)];
result = cards(await render({ [form.id]: draft }));
assert.equal(result[0].attribs.id, 'events-acceptance-card');
events.cards = [];
assert.equal(cards(await render({ [form.id]: draft })).length, 0);
const restored = cards(await render({}));
assert.deepEqual(
  restored.map((node) => node.attribs.id),
  baseline.map((node) => node.attribs.id),
);
assert.ok(!restored.some((node) => DomUtils.textContent(node).includes('Title-only draft')));
console.log(
  'Marketing built preview: title-only card, stable ID, reorder, clear and baseline restoration passed.',
);
