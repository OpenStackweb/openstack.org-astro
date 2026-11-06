import assert from 'node:assert/strict';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifySiteBuild } from './lib/site-build-profile.mjs';

await verifySiteBuild('production');
function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
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
// Versions operations never modify routes, domains, or cron schedules. The CI
// credential only needs Worker publishing permission, not zone route editing.
const output = resolve('.production-release/upload.jsonl');
await rm(output, { force: true });
run(['node_modules/wrangler/bin/wrangler.js', 'versions', 'upload', '--config', path], {
  ...process.env,
  WRANGLER_OUTPUT_FILE_PATH: output,
});
const events = (await readFile(output, 'utf8'))
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));
const uploaded = events.filter((event) => event.type === 'version-upload');
assert.equal(uploaded.length, 1, 'Expected exactly one uploaded version');
assert.equal(uploaded[0].worker_name, 'openstack-org-production');
const version = uploaded[0].version_id;
assert.match(version, /^[a-f0-9-]{36}$/);
run([
  'node_modules/wrangler/bin/wrangler.js',
  'versions',
  'deploy',
  `${version}@100`,
  '--yes',
  '--config',
  path,
  '--message',
  `GitHub ${process.env.GITHUB_SHA || 'verified release'}`,
]);
