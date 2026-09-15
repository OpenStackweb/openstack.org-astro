import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

// Exercise the built Worker only. These requests render drafts; none save to Tina/Git.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4536';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const nodes = html => DomUtils.findAll(node => node.type === 'tag', parseDocument(html).children);
const heading = html => DomUtils.textContent(nodes(html).find(node => node.name === 'h1'));
async function preview(data, prime = false) {
  const response = await fetch(`${base}/tina-island/homepage`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-tina-preview+json', ...(prime ? { 'X-Tina-Prime': '1' } : {}) },
    body: JSON.stringify(data), signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return response.text();
}
async function ordinary() {
  const response = await fetch(`${base}/`, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200);
  return response.text();
}
const initial = await preview({}, true);
const form = JSON.parse(nodes(initial).find(node => node.attribs['data-tina-form'])?.attribs['data-tina-form'] || 'null');
assert.ok(form?.id && form.data?.homepage, 'Use the real homepage query and document shape');
const originalHeading = heading(initial);
assert.equal(heading(await ordinary()), originalHeading);
const markers = Array.from({ length: 16 }, (_, i) => `ISOLATED-DRAFT-${i}-ONLY`);
const results = await Promise.allSettled(markers.map(async marker => {
  const draft = structuredClone(form.data);
  draft.homepage.hero.title = marker;
  const [draftHtml, publicHtml] = await Promise.all([
    preview({ [form.id]: draft }), ordinary(),
  ]);
  assert.equal(heading(draftHtml), marker);
  for (const other of markers.filter(value => value !== marker)) assert.ok(!draftHtml.includes(other));
  assert.equal(heading(publicHtml), originalHeading);
  for (const other of markers) assert.ok(!publicHtml.includes(other));
}));
const failures = results.filter(result => result.status === 'rejected');
assert.deepEqual(failures.map(result => result.reason?.message), []);
assert.equal(heading(await preview({}, true)), originalHeading);
assert.equal(heading(await ordinary()), originalHeading);
console.log('PASS: 16 concurrent draft previews isolated; concurrent public responses and final baseline unchanged. Save-conflict behavior is not covered.');
