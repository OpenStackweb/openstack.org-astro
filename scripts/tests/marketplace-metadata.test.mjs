import test from 'node:test';
import assert from 'node:assert/strict';
import { marketplaceMetadata } from '../../src/lib/server/marketplace-metadata.mjs';

test('provider metadata distinguishes service types and uses readable public description text', () => {
  const record = {
    name: 'Example Cloud',
    company: { name: 'Example' },
    href: '/marketplace/public-clouds/example/cloud/',
    descriptionHtml: '<p>Compute &amp; storage.</p><p>Public <strong>cloud</strong>.</p>',
  };
  const publicCloud = marketplaceMetadata(record, { title: 'Public Clouds' });
  const privateCloud = marketplaceMetadata(record, { title: 'Hosted Private Clouds' });
  assert.notEqual(publicCloud.title, privateCloud.title);
  assert.equal(publicCloud.description, 'Compute & storage. Public cloud.');
  assert.doesNotMatch(publicCloud.description, /<|&amp;/);
  assert.match(
    marketplaceMetadata({ ...record, descriptionHtml: '' }, { title: 'Public Clouds' }).description,
    /Example Cloud from Example/,
  );
  const long = marketplaceMetadata(
    { ...record, descriptionHtml: '<p>' + 'Cloud infrastructure. '.repeat(30) + '</p>' },
    { title: 'Public Clouds' },
  );
  assert.ok(long.description.length <= 201);
  assert.ok(long.description.endsWith('…'));
});
