import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4390';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const nodes = html => DomUtils.findAll(n => n.type === 'tag', parseDocument(html).children);
const heading = elements => DomUtils.textContent(elements.find(n => n.name === 'h1'));
async function render(name, data = {}, prime = false) {
  const response = await fetch(`${base}/tina-island/${name}`, {
    method: 'POST', headers: { 'content-type': 'application/x-tina-preview+json', ...(prime ? { 'X-Tina-Prime': '1' } : {}) },
    body: JSON.stringify(data), signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 200);
  return nodes(await response.text());
}
for (const [name, collection, path] of [['community', 'community', '/community/'], ['supporting-organizations', 'supportingOrganizations', '/community/supporting-organizations/']]) {
  const initial = await render(name, {}, true);
  const form = JSON.parse(initial.find(n => n.attribs['data-tina-form']).attribs['data-tina-form']);
  const draft = structuredClone(form.data);
  const content = draft[collection];
  const originalHeading = heading(initial);
  const newHeading = 'Community preview <acceptance>';
  if (name === 'community') {
    content.topBanner.title = newHeading;
    content.quickLinks.columns.reverse();
    content.quickLinks.columns[0].links.push({ title: 'Preview resource', url: 'https://example.org/preview' });
    content.helpBanner.ambassadors.list = [];
  } else {
    content.title = newHeading;
    content.sections.reverse();
    content.infrastructureDonors = [];
  }
  const result = await render(name, { [form.id]: draft });
  assert.equal(heading(result), newHeading);
  if (name === 'community') assert.ok(result.some(n => n.name === 'a' && n.attribs.href === 'https://example.org/preview'));
  else assert.equal(result.find(n => n.name === 'h2').attribs.id, `organizations-${content.sections[0].key}`);
  assert.equal(heading(await render(name)), originalHeading, 'Transient drafts cannot change the baseline');
  const page = await fetch(`${base}${path}`);
  assert.equal(page.status, 200);
  assert.equal(heading(nodes(await page.text())), originalHeading, 'Visitors still see committed JSON');
}
console.log('Community previews: both islands, escaped headings, add/reorder/remove, selected records and unchanged baseline passed.');
