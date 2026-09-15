import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialPreviewConfig } from '../lib/editorial-preview-config.mjs';
const source = () => ({ name: 'openstack-org-astro', account_id: '2f794481bbde50a491af00a5766012a7', workers_dev: false, preview_urls: false,
  main: 'entry.mjs', assets: { binding: 'ASSETS', directory: '../client' }, vars: { PUBLIC_TINA_CLIENT_ID: 'test-project' },
  compatibility_date: '2026-09-12', compatibility_flags: ['nodejs_compat'], no_bundle: true,
  r2_buckets: [{ binding: 'MEDIA', bucket_name: 'openstack-org-beta-media' }] });
test('preview preparation isolates the Worker without changing source or exposing URLs', () => {
  const config = source(); const original = structuredClone(config);
  config.services = [{ binding: 'BUSINESS', service: 'production' }];
  const result = editorialPreviewConfig(config);
  assert.equal(result.name, 'openstack-org-astro-editorial');
  assert.equal(result.workers_dev, false); assert.equal(result.preview_urls, false);
  assert.equal(result.services, undefined); assert.equal(result.routes, undefined);
  result.r2_buckets[0].bucket_name = 'changed';
  assert.deepEqual(config.r2_buckets, original.r2_buckets);
});
test('rejects source routes, unexpected credentials, test authorization and wrong account/bucket', () => {
  for (const override of [
    { routes: ['www.openstack.org/*'] }, { workers_dev: true }, { preview_urls: true },
    { account_id: 'other' }, { vars: { PUBLIC_TINA_CLIENT_ID: 'test', CMS_LOCAL_TEST: '1' } },
    { vars: { PUBLIC_TINA_CLIENT_ID: 'test', SECRET: 'unexpected' } },
    { r2_buckets: [{ binding: 'MEDIA', bucket_name: 'other' }] },
  ]) assert.throws(() => editorialPreviewConfig({ ...source(), ...override }));
});
