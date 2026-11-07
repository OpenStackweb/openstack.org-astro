import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  siteBuildProfile,
  siteBuildStamp,
  assertSiteBuild,
  fingerprintSiteBuild,
  verifySiteBuild,
} from '../lib/site-build-profile.mjs';
import { productionCandidateConfig } from '../lib/production-candidate-config.mjs';

const script = (name) => fileURLToPath(new URL('../' + name, import.meta.url));
const source = () => ({
  name: 'openstack-org-astro',
  account_id: '2f794481bbde50a491af00a5766012a7',
  workers_dev: false,
  preview_urls: false,
  main: 'entry.mjs',
  no_bundle: true,
  compatibility_date: '2026-09-12',
  compatibility_flags: ['nodejs_compat'],
  assets: { directory: '../client', binding: 'ASSETS' },
  rules: [{ type: 'ESModule', globs: ['**/*.js', '**/*.mjs'] }],
  vars: {
    PUBLIC_TINA_CLIENT_ID: 'synthetic-project',
    VISITOR_AUTH_ENABLED: 'true',
    VISITOR_AUTH_CLIENT_ID: 'synthetic-review-client',
    SURVEY_SERVICE_ORIGIN: 'https://survey-staging.openstack.org',
  },
  r2_buckets: [{ binding: 'MEDIA', bucket_name: 'openstack-org-beta-media' }],
});

async function fixture(profile) {
  const root = await mkdtemp(join(tmpdir(), 'site-build-profile-'));
  await mkdir(join(root, 'dist/client'), { recursive: true });
  await mkdir(join(root, 'dist/server/chunks'), { recursive: true });
  await writeFile(join(root, 'dist/client/index.html'), '<html>synthetic</html>');
  await writeFile(join(root, 'dist/server/entry.mjs'), '// synthetic entry');
  await writeFile(join(root, 'dist/server/chunks/manifest.mjs'), '// synthetic manifest');
  await writeFile(join(root, 'dist/server/wrangler.json'), JSON.stringify(source()));
  await writeFile(
    join(root, 'dist/site-build-profile.json'),
    JSON.stringify(siteBuildStamp(profile, await fingerprintSiteBuild(root))),
  );
  await writeFile(
    join(root, 'no-network.mjs'),
    'globalThis.fetch = () => { throw new Error("Unexpected network operation"); };',
  );
  return root;
}
function run(root, name, environment = {}) {
  return spawnSync(process.execPath, ['--import', join(root, 'no-network.mjs'), script(name)], {
    cwd: root,
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, ...environment },
  });
}

test('build origins are explicit; existing builds stay on review by default', () => {
  assert.deepEqual(siteBuildProfile(), { name: 'review', site: 'https://astro.openstack.org' });
  assert.deepEqual(siteBuildProfile('production'), {
    name: 'production',
    site: 'https://www.openstack.org',
  });
  for (const invalid of ['', 'www', 'Production', 'unknown', true])
    assert.throws(() => siteBuildProfile(invalid), /Unknown site build profile/);
});

test('build record binds the profile and complete compiled file registry', () => {
  const files = [
    { path: 'dist/server/entry.mjs', sha256: 'a'.repeat(64) },
    { path: 'dist/server/wrangler.json', sha256: 'b'.repeat(64) },
  ];
  const record = siteBuildStamp('production', files);
  assert.doesNotThrow(() => assertSiteBuild(record, 'production', files));
  assert.throws(() => assertSiteBuild(record, 'review', files), /profile\/origin/);
  assert.throws(
    () => assertSiteBuild({ ...record, site: 'https://astro.openstack.org' }, 'production', files),
    /profile\/origin/,
  );
  assert.throws(
    () =>
      assertSiteBuild(record, 'production', [
        ...files,
        { path: 'dist/server/extra.mjs', sha256: 'c' },
      ]),
    /changed/,
  );
  assert.throws(() => siteBuildStamp('production', []), /incomplete/);
  files[0].sha256 = 'changed';
  assert.equal(record.files[0].sha256, 'a'.repeat(64));
});

test('production target preserves public registrations without visitor/service activation or schedules', () => {
  const input = source();
  input.services = [{ binding: 'BUSINESS', service: 'existing-staging' }];
  input.triggers = { crons: ['17 6 * * *'] };
  input.queues = { producers: [{ binding: 'JOBS', queue: 'existing' }] };
  const original = structuredClone(input);
  const result = productionCandidateConfig(input);
  assert.equal(result.name, 'openstack-org-production');
  assert.deepEqual(result.vars, {
    SITE_DEPLOYMENT: 'production',
    VISITOR_AUTH_ENABLED: 'false',
    PUBLIC_TINA_CLIENT_ID: 'synthetic-project',
    VISITOR_AUTH_CLIENT_ID: 'synthetic-review-client',
  });
  assert.equal(result.workers_dev, false);
  assert.equal(result.preview_urls, false);
  assert.deepEqual(result.routes, []);
  assert.deepEqual(result.triggers, { crons: [] });
  assert.equal(result.services, undefined);
  assert.equal(result.queues, undefined);
  result.assets.directory = 'changed';
  result.r2_buckets[0].bucket_name = 'changed';
  assert.deepEqual(input, original);
});

test('unexpected routes, capabilities, test authorization and wrong account/media are refused', () => {
  for (const overrides of [
    { name: 'other' },
    { account_id: 'other' },
    { workers_dev: true },
    { preview_urls: true },
    { routes: ['www.openstack.org/*'] },
    { rules: [] },
    { vars: { CMS_LOCAL_TEST: '1' } },
    { vars: { SURVEY_ACCESS_CLIENT_SECRET: 'synthetic-private' } },
    { vars: { PUBLIC_TINA_CLIENT_ID: 'bad id' } },
    { r2_buckets: [{ binding: 'MEDIA', bucket_name: 'other' }] },
  ]) {
    assert.throws(() => productionCandidateConfig({ ...source(), ...overrides }));
  }
});

test('changed manifest/assets and extra/missing files invalidate the build record', async () => {
  const root = await fixture('production');
  try {
    await verifySiteBuild('production', root);
    const manifest = join(root, 'dist/server/chunks/manifest.mjs');
    await writeFile(manifest, '// changed site origin');
    await assert.rejects(verifySiteBuild('production', root), /changed/);
    await writeFile(manifest, '// synthetic manifest');
    const asset = join(root, 'dist/client/index.html');
    await writeFile(asset, '<html>changed</html>');
    await assert.rejects(verifySiteBuild('production', root), /changed/);
    await writeFile(asset, '<html>synthetic</html>');
    const extra = join(root, 'dist/server/extra.mjs');
    await writeFile(extra, '// extra');
    await assert.rejects(verifySiteBuild('production', root), /changed/);
    await rm(extra);
    await rm(asset);
    await assert.rejects(verifySiteBuild('production', root), /changed/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production CLI rejects a review build and removes stale candidate output', async () => {
  const root = await fixture('review');
  try {
    const path = join(root, 'dist/server/wrangler.production.json');
    await writeFile(path, '{"stale":true}');
    const result = run(root, 'prepare-production-candidate.mjs');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /profile\/origin/);
    await assert.rejects(readFile(path), { code: 'ENOENT' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production CLI writes a separate isolated config without changing source build identity', async () => {
  const root = await fixture('production');
  try {
    const result = run(root, 'prepare-production-candidate.mjs');
    assert.equal(result.status, 0, result.stderr);
    const config = JSON.parse(await readFile(join(root, 'dist/server/wrangler.production.json')));
    assert.deepEqual(config, productionCandidateConfig(source()));
    await verifySiteBuild('production', root);
    assert.equal(
      JSON.parse(await readFile(join(root, 'dist/server/wrangler.json'))).name,
      'openstack-org-astro',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('review deployment and editorial preparation reject production builds before network/upload', async () => {
  const root = await fixture('production');
  try {
    for (const name of ['deploy.mjs', 'prepare-editorial-preview.mjs']) {
      const result = run(root, name);
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /profile\/origin/);
      assert.doesNotMatch(result.stderr, /Unexpected network operation/);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('a rejected build profile invalidates the previous build record and production candidate', async () => {
  const root = await fixture('production');
  try {
    const candidate = join(root, 'dist/server/wrangler.production.json');
    await writeFile(candidate, '{"stale":true}');
    const result = run(root, 'build.mjs', { OPENSTACK_BUILD_PROFILE: 'unknown' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unknown site build profile/);
    await assert.rejects(readFile(candidate), { code: 'ENOENT' });
    await assert.rejects(readFile(join(root, 'dist/site-build-profile.json')), { code: 'ENOENT' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production CMS routing preserves existing Worker-first routes without mutating preview', () => {
  const input = source();
  input.assets.run_worker_first = ['/blog', '/blog/*'];
  assert.deepEqual(productionCandidateConfig(input).assets.run_worker_first,
    ['/blog', '/blog/*', '/admin', '/admin/*']);
  assert.deepEqual(input.assets.run_worker_first, ['/blog', '/blog/*']);
  input.assets.run_worker_first = true;
  assert.equal(productionCandidateConfig(input).assets.run_worker_first, true);
});
