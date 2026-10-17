import { readFile, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { verifySiteBuild } from './lib/site-build-profile.mjs';
import { productionCandidateConfig } from './lib/production-candidate-config.mjs';

await rm('dist/server/wrangler.production.json', { force: true });
const { config: source } = await verifySiteBuild('production');
try {
  const admin = await readFile('dist/client/admin/index.html', 'utf8');
  assert.ok(!/localhost:4001|127\.0\.0\.1:4001/.test(admin), 'Local editor output cannot enter a candidate');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = productionCandidateConfig(source);
await writeFile('dist/server/wrangler.production.json', JSON.stringify(config, null, 2) + '\n');
console.log('Prepared unroutable dist/server/wrangler.production.json. No upload or hostname changes.');
console.log('Application activation, indexing, CMS/services, protection and cutover acceptance remain separate.');
