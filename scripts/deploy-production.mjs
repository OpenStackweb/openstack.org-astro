import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { verifySiteBuild } from './lib/site-build-profile.mjs';

await verifySiteBuild('production');
function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  assert.equal(result.status, 0, 'Production release command failed');
}
const path = '.production-release/wrangler.json';
run(['scripts/prepare-production-release.mjs', path, '--public-indexing']);
const config = JSON.parse(await readFile(path, 'utf8'));
assert.equal(config.name, 'openstack-org-production');
// Preserve the routes and schedule established at cutover; never manage DNS here.
config.routes = [
  { pattern: 'www.openstack.org/*', zone_name: 'openstack.org' },
  { pattern: 'openstack.org/*', zone_name: 'openstack.org' },
];
config.triggers = { crons: ['17 6 * * *'] };
// Existing Worker secrets stay on the production Worker; never copy preview secrets.
await writeFile(path, JSON.stringify(config, null, 2) + '\n');
run(['node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', path]);
