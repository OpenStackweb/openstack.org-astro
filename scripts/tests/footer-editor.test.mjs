import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { footerMedia, validateFooterSubmission } from '../../tina/footer-validation.mjs';
const raw = JSON.parse(readFileSync(new URL('../../src/lib/content/footer.json', import.meta.url), 'utf8'));
test('Footer validation preserves stored data and resolves both legacy and uploaded media', () => {
  assert.equal(validateFooterSubmission(raw), raw);
  assert.equal(footerMedia('mastodon.svg'), '/images/footer/mastodon.svg');
  const uploaded = '/review/media/' + 'a'.repeat(40) + '/qr.png';
  assert.equal(footerMedia(uploaded), uploaded);
  assert.equal(footerMedia(null), '');
});
test('Footer submission blocks executable links, unsafe attributes and unsupported media references', () => {
  const link = structuredClone(raw); link.columns[0].items[0].link = 'javascript:alert(1)';
  assert.throws(() => validateFooterSubmission(link), /Footer links/);
  const attr = structuredClone(raw); attr.social.networks[0].clickBehaviour.attributes = [{ attribute: 'onclick', value: 'alert(1)' }];
  assert.throws(() => validateFooterSubmission(attr), /Supported link attributes/);
  assert.throws(() => footerMedia('unknown-local-image.png'), /uploaded image/);
});

test('Footer publishing requires named destinations while draft rendering permits an unfinished entry', () => {
  const draft = { columns: [{ items: [{ title: '', link: '' }] }] };
  assert.equal(validateFooterSubmission(draft), draft);
  assert.throws(() => validateFooterSubmission(draft, { complete: true }), /text and a destination/);
  draft.columns[0].items[0] = { title: 'Software', link: '/software/' };
  assert.equal(validateFooterSubmission(draft, { complete: true }), draft);
});
