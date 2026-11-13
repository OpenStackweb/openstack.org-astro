import test from 'node:test';
import assert from 'node:assert/strict';
import { socialPreview } from '../../src/lib/server/social-preview.mjs';

test('default unfurls use a compact symbol and readable page-specific text', () => {
  const result = socialPreview({
    title: 'Training | OpenStack',
    description: '<p>Learn <strong>OpenStack</strong> with <a href="https://example.org">training</a>.</p>',
    image: '/images/social/openstack.png',
    card: 'summary_large_image',
  });
  assert.equal(result.title, 'Training');
  assert.equal(result.description, 'Learn OpenStack with training.');
  assert.equal(result.card, 'summary');
  assert.equal(result.image, '/images/social/openstack-symbol-v1.png');
  assert.equal(result.imageAlt, 'OpenStack');
});

test('custom editorial images and card types remain intact', () => {
  const result = socialPreview({ title: 'A story', description: 'A sentence. '.repeat(30), image: '/story.jpg', imageAlt: 'Event photo', card: 'summary_large_image' });
  assert.equal(result.image, '/story.jpg');
  assert.equal(result.imageAlt, 'Event photo');
  assert.equal(result.card, 'summary_large_image');
  assert.ok(result.description.length <= 161);
  assert.ok(result.description.endsWith('…'));
  assert.equal(result.isDefault, false);
});
