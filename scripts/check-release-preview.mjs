import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

// Exercise an unpublished announcement using ephemeral Tina overlays only.
// Never create a Git record, publish a release, or write to a catalogue service.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4527';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const filename = 'local-authoring-check';
const publicPath = `/software/openstack-${filename}/`;
const endpoint = `${base}/tina-island/release-announcement?document=${filename}&draft=true`;
const elements = html => DomUtils.findAll(n => n.type === 'tag', parseDocument(html).children);
async function request(path, options = {}) {
  return fetch(base + path, { ...options, signal: AbortSignal.timeout(15000) });
}
async function render(body, prime = false) {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'content-type': 'application/x-tina-preview+json',
      ...(prime ? { 'X-Tina-Prime': '1' } : {}) },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200);
  return elements(await response.text());
}
const listBefore = await (await request('/api/cms/releases')).text();
assert.ok(!JSON.parse(listBefore).some(item => item.slug === filename));
const publicBefore = await request(publicPath, { redirect: 'manual' });
assert.equal(publicBefore.status, 302);
assert.equal(publicBefore.headers.get('location'), '/comparison/?section=software');
assert.equal((await request(`/cms-preview/release/${filename}`)).status, 200);
const baseline = await render({}, true);
const form = JSON.parse(baseline.find(n => n.attribs['data-tina-form'])?.attribs['data-tina-form'] || 'null');
assert.equal(form?.data?.releaseAnnouncement?.slug, filename);
const draft = structuredClone(form.data);
Object.assign(draft.releaseAnnouncement, {
  title: 'Draft release <review>', description: 'Local unpublished announcement.',
  body: '<h2>New editorial section</h2><p>Release copy <strong>for review</strong>.</p>',
  contributorIntroduction: 'Credits in editorial order.',
  contributors: ['Second contributor', 'First contributor <review>'],
});
const populated = await render({ [form.id]: draft });
assert.ok(populated.some(n => n.name === 'h1' && DomUtils.textContent(n) === 'Draft release <review>'));
assert.ok(populated.some(n => n.name === 'h2' && DomUtils.textContent(n) === 'New editorial section'));
const credits = populated.find(n => n.name === 'ul' && n.attribs.class === 'contributors');
assert.deepEqual(credits.children.filter(n => n.name === 'li').map(DomUtils.textContent),
  ['Second contributor', 'First contributor <review>']);
Object.assign(draft.releaseAnnouncement, { slug: '', title: '', body: '', contributorIntroduction: '', contributors: [] });
const cleared = await render({ [form.id]: draft });
assert.ok(cleared.some(n => n.name === 'h1' && DomUtils.textContent(n) === 'Untitled release announcement'));
assert.ok(!cleared.some(n => n.attribs.class === 'contributors'));
const restored = await render({});
assert.ok(restored.some(n => n.name === 'h1' && DomUtils.textContent(n) === 'Unpublished release announcement'));
assert.equal(await (await request('/api/cms/releases')).text(), listBefore);
const publicAfter = await request(publicPath, { redirect: 'manual' });
assert.equal(publicAfter.status, publicBefore.status);
assert.equal(publicAfter.headers.get('location'), publicBefore.headers.get('location'));
console.log('Unpublished release preview: copy, ordered credits, cleared fields and unchanged public listing/route passed.');
