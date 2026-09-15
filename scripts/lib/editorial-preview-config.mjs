import assert from 'node:assert/strict';

/** Prepare a separate, initially unroutable Worker. No network operations. */
export function editorialPreviewConfig(source) {
  assert.equal(source.name, 'openstack-org-astro', 'Expected the Astro build output');
  assert.equal(source.account_id, '2f794481bbde50a491af00a5766012a7');
  assert.equal(source.workers_dev, false);
  assert.equal(source.preview_urls, false);
  assert.ok(!source.routes?.length, 'Do not copy hostname routes');
  assert.ok(!source.vars?.CMS_LOCAL_TEST, 'Local test authorization cannot enter a preview');
  assert.deepEqual(Object.keys(source.vars || {}).sort(), ['PUBLIC_TINA_CLIENT_ID']);
  assert.ok(source.vars.PUBLIC_TINA_CLIENT_ID, 'Hosted Tina project ID is required');
  assert.equal(source.main, 'entry.mjs');
  assert.equal(source.assets?.directory, '../client');
  assert.equal(source.assets?.binding, 'ASSETS');
  assert.deepEqual(source.r2_buckets, [{ binding: 'MEDIA', bucket_name: 'openstack-org-beta-media' }]);
  // Explicit allowlist: do not accidentally inherit services, queues, databases,
  // schedules or identity secrets when the main site's capabilities grow.
  return {
    name: 'openstack-org-astro-editorial',
    account_id: source.account_id,
    main: source.main,
    compatibility_date: source.compatibility_date,
    compatibility_flags: [...source.compatibility_flags],
    no_bundle: source.no_bundle,
    assets: { ...source.assets },
    vars: { ...source.vars },
    r2_buckets: source.r2_buckets.map(binding => ({ ...binding })),
    workers_dev: false,
    preview_urls: false,
  };
}
