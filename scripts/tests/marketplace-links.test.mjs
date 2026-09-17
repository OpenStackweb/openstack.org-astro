import test from 'node:test';
import assert from 'node:assert/strict';
import { marketplaceHref } from '../../src/lib/marketplace/links.mjs';
test('editorial Marketplace links retain safe destinations and reject active content', () => {
  assert.equal(marketplaceHref('/marketplace/training/'), '/marketplace/training/');
  assert.equal(marketplaceHref('mailto:ecosystem@openstack.org'), 'mailto:ecosystem@openstack.org');
  assert.equal(marketplaceHref('https://example.org/resource'), 'https://example.org/resource');
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '', null]) assert.equal(marketplaceHref(value), '#');
});
