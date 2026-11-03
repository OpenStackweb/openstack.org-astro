import assert from 'node:assert/strict';

/** Unroutable candidate only; callers must verify the production build record. */
export function productionCandidateConfig(source) {
  assert.equal(source.name, 'openstack-org-astro');
  assert.equal(source.account_id, '2f794481bbde50a491af00a5766012a7');
  assert.equal(source.workers_dev, false);
  assert.equal(source.preview_urls, false);
  assert.ok(!source.routes?.length, 'Hostname routing must be reviewed separately');
  assert.ok(!source.vars?.CMS_LOCAL_TEST, 'Local test authorization cannot enter a candidate');
  const knownVars = [
    'PUBLIC_TINA_CLIENT_ID',
    'VISITOR_AUTH_ENABLED',
    'VISITOR_AUTH_CLIENT_ID',
    'SURVEY_SERVICE_ORIGIN',
    'MARKETPLACE_SERVICE_ORIGIN',
    'SITE_DEPLOYMENT',
  ];
  assert.ok(
    Object.keys(source.vars || {}).every((key) => knownVars.includes(key)),
    'Unexpected runtime variable',
  );
  assert.equal(source.main, 'entry.mjs');
  assert.deepEqual(source.rules, [{ type: 'ESModule', globs: ['**/*.js', '**/*.mjs'] }]);
  assert.equal(source.assets?.directory, '../client');
  assert.equal(source.assets?.binding, 'ASSETS');
  assert.deepEqual(source.r2_buckets, [
    { binding: 'MEDIA', bucket_name: 'openstack-org-beta-media' },
  ]);
  const vars = { SITE_DEPLOYMENT: 'production', VISITOR_AUTH_ENABLED: 'false' };
  // Preserve the approved public registrations, not their private credentials.
  for (const key of ['PUBLIC_TINA_CLIENT_ID', 'VISITOR_AUTH_CLIENT_ID']) {
    if (source.vars?.[key] === undefined) continue;
    const value = source.vars[key];
    assert.ok(
      typeof value === 'string' &&
        value.length > 0 &&
        value.length <= 256 &&
        !/[\s\x00-\x1f\x7f]/.test(value),
      'Invalid public registration identifier',
    );
    vars[key] = value;
  }
  return {
    name: 'openstack-org-production',
    account_id: source.account_id,
    main: source.main,
    compatibility_date: source.compatibility_date,
    compatibility_flags: [...source.compatibility_flags],
    no_bundle: source.no_bundle,
    rules: structuredClone(source.rules),
    assets: { ...source.assets },
    vars,
    r2_buckets: structuredClone(source.r2_buckets),
    workers_dev: false,
    preview_urls: false,
    routes: [],
    triggers: { crons: [] },
  };
}
