import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalFor } from '../../src/lib/seo.mjs';

test('release catalogues and translations retain their own search identities', () => {
  const path = '/software/project-navigator/openstack-components';
  assert.notEqual(canonicalFor(path, { release: 'antelope' }), canonicalFor(path, { release: 'dalmatian' }));
  assert.equal(canonicalFor('/paper/', { locale: 'en_US' }), 'https://www.openstack.org/paper/');
  assert.equal(canonicalFor('/paper', { locale: 'ja_JP' }), 'https://www.openstack.org/paper/?lang=ja_JP');
});

test('verified archive duplicate URLs consolidate without affecting other archives', () => {
  assert.equal(canonicalFor('/summit/vancouver-2018/venues-2'), canonicalFor('/summit/vancouver-2018/venues/'));
  assert.equal(canonicalFor('/summit/austin-2016/summit-schedule/track-list/'), canonicalFor('/summit/austin-2016/categories/track-list/'));
  assert.equal(canonicalFor('/summit/boston-2017/venues'), 'https://www.openstack.org/summit/boston-2017/venues/');
});
