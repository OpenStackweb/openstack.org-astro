import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

// Send ephemeral overlays to the built Tina preview endpoint. Never save to
// TinaCloud, Git or the local content files during this check.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4521';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const url = `${base}/tina-island/editorial?document=summit-barcelona-2016`;
const elements = html => DomUtils.findAll(node => node.type === 'tag', parseDocument(html).children);
async function render(body, prime = false) {
  const response = await fetch(url, {
    method: 'POST', headers: {
      'content-type': 'application/x-tina-preview+json',
      ...(prime ? { 'X-Tina-Prime': '1' } : {}),
    }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, 'Built preview endpoint renders the overlay');
  return elements(await response.text());
}
const original = await render({}, true);
const form = JSON.parse(original.find(node => node.attribs['data-tina-form'])?.attribs['data-tina-form'] || 'null');
assert.ok(form?.id && form.data?.editorial, 'Priming supplies the actual editorial query ID');
const data = structuredClone(form.data);
data.editorial.highlights.hero.image = '';
data.editorial.highlights.promotion.image = '';
data.editorial.highlights.keynotes = [
  {}, { title: 'Draft keynote without image', day: 'Day1', description: 'Draft text.' },
];
data.editorial.highlights.photos = [{}, { title: 'Pending image', image: '' }];
const draft = await render({ [form.id]: data });
assert.ok(draft.some(node => node.name === 'h3' && DomUtils.textContent(node) === 'Draft keynote without image'));
assert.equal(draft.filter(node => 'data-keynote' in node.attribs).length, 1);
assert.equal(draft.filter(node => node.name === 'img' && !node.attribs.src?.trim()).length, 0);
assert.equal(draft.filter(node => node.name === 'a' && !node.attribs.href?.trim()).length, 0);
assert.equal(draft.filter(node => /url\(['"]?['"]?\)/.test(node.attribs.style || '')).length, 0);
const after = await render({});
assert.equal(after.filter(node => 'data-keynote' in node.attribs).length, 1);
assert.ok(!after.some(node => DomUtils.textContent(node) === 'Draft keynote without image'));
assert.equal(after.filter(node => node.name === 'section' && node.attribs.class?.includes('photos')).length, 1);
console.log('Highlights preview: incomplete media omitted, text keynote retained, subsequent render unchanged.');
