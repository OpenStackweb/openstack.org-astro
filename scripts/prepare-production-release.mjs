import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { verifySiteBuild } from './lib/site-build-profile.mjs';
import { productionCandidateConfig } from './lib/production-candidate-config.mjs';

// Prepare outside dist so the verified compiled-output fingerprint remains stable.
// Upload, secrets and hostname routing are explicit, separate release operations.
const [output, ...flags] = process.argv.slice(2);
assert.ok(output && flags.every((flag) => flag === '--public-indexing'));
const target = resolve(output);
assert.ok(!target.startsWith(resolve('dist') + '/'), 'Keep release config outside dist');
const { config: source, stamp } = await verifySiteBuild('production');
const config = productionCandidateConfig(source);
const admin = await readFile('dist/client/admin/index.html', 'utf8');
assert.ok(!/localhost:4001|127\.0\.0\.1:4001/.test(admin), 'Hosted CMS build required');
assert.ok(config.vars.PUBLIC_TINA_CLIENT_ID, 'Hosted Tina registration required');
assert.ok(config.vars.VISITOR_AUTH_CLIENT_ID, 'Approved public visitor registration required');
config.main = resolve('dist/server/entry.mjs');
config.assets.directory = resolve('dist/client');
config.vars = {
  ...config.vars,
  VISITOR_AUTH_ENABLED: 'true',
  SITE_INDEXING_ENABLED: flags.includes('--public-indexing') ? 'true' : 'false',
  MARKETPLACE_SERVICE_ORIGIN: 'https://marketplace.openstack.org',
  // Existing service-only Access origin; activation hands it to the production runtime.
  SURVEY_SERVICE_ORIGIN: 'https://survey-staging.openstack.org',
};
await mkdir(dirname(target), { recursive: true });
await writeFile(target, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
await writeFile(
  target + '.manifest.json',
  JSON.stringify(
    {
      build: stamp,
      publicOrigin: 'https://www.openstack.org',
      routingEnabled: false,
      jobsEnabled: false,
      indexingEnabled: config.vars.SITE_INDEXING_ENABLED === 'true',
      requiredSecrets: [
        'BLOG_ACCESS_CLIENT_ID',
        'BLOG_ACCESS_CLIENT_SECRET',
        'SURVEY_ACCESS_CLIENT_ID',
        'SURVEY_ACCESS_CLIENT_SECRET',
        'EDITORIAL_GITHUB_TOKEN',
        'SOFTWARE_REFRESH_GITHUB_TOKEN',
        'YOUTUBE_API_KEY',
      ],
    },
    null,
    2,
  ) + '\n',
  { mode: 0o600 },
);
console.log('Prepared production service bindings; no upload, routes, jobs or DNS changes.');
