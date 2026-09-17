import test from 'node:test';
import assert from 'node:assert/strict';
import { contentHref } from '../../src/lib/content-links.mjs';
test('CMS editorial links retain safe destinations and reject active content', () => {
  assert.equal(contentHref('/marketplace/training/'), '/marketplace/training/');
  assert.equal(contentHref('mailto:ecosystem@openstack.org'), 'mailto:ecosystem@openstack.org');
  assert.equal(contentHref('https://example.org/resource'), 'https://example.org/resource');
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '', null])
    assert.equal(contentHref(value), '#');
});
