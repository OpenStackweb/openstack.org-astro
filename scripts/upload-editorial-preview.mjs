import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { editorialPreviewConfig } from './lib/editorial-preview-config.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
const [branch, revision, ...extra] = process.argv.slice(2);
assert.ok(branch && revision && !extra.length, 'Usage: node scripts/upload-editorial-preview.mjs <editorial-branch> <full-commit-sha>');
assert.ok(process.env.CLOUDFLARE_API_TOKEN, 'Worker upload token is required');
assert.ok(process.env.CLOUDFLARE_ACCESS_API_TOKEN, 'Access verification token is required');
rmSync('dist/editorial-publication.json', {force:true});
const worker = 'openstack-org-astro-editorial';
const workerId = '947061288427444b969d1690ed3f9cd9';
const account = '2f794481bbde50a491af00a5766012a7';
const app = 'eae40719-c49d-4b63-8694-a80c22631489';
const sourceApp = 'afc1e887-15e3-408a-afc1-b641876d3a09';
const base = `https://api.cloudflare.com/client/v4/accounts/${account}`;
const alias = `b-${createHash('sha256').update(branch).digest('hex').slice(0,12)}-${revision.slice(0,8)}`;
const config = JSON.parse(readFileSync('dist/server/wrangler.editorial.json'));
assert.deepEqual(config, editorialPreviewConfig(JSON.parse(readFileSync('dist/server/wrangler.json'))));
assert.ok(!/localhost:4001|127\.0\.0\.1:4001/.test(readFileSync('dist/client/admin/index.html','utf8')));

async function api(path, access = false, body) {
  const response = await fetch(base + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${access ? process.env.CLOUDFLARE_ACCESS_API_TOKEN : process.env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  assert.equal(result.success, true, `Cloudflare ${path} failed (${response.status}; ${result.errors?.map(e=>e.code).join(',')})`);
  return result.result;
}
async function verifyAccess() {
  const application = await api(`/access/apps/${app}`, true);
  assert.deepEqual(application.destinations, [{type:'worker',worker_id:workerId}]);
  const policies = await api(`/access/apps/${app}/policies`, true);
  const approved = await api(`/access/apps/${sourceApp}/policies`, true);
  assert.equal(policies.length, 1); assert.equal(approved.length, 1);
  for (const policy of [policies[0], approved[0]]) {
    assert.equal(policy.decision, 'allow');
    assert.deepEqual(policy.exclude, []); assert.deepEqual(policy.require, []);
    assert.ok(policy.include.some(i=>i.email_domain?.domain==='openinfra.org'));
    assert.ok(policy.include.some(i=>i.email_domain?.domain==='tipit.net'));
  }
  const normalized = p => p.include.map(i=>JSON.stringify(i)).sort();
  assert.deepEqual(normalized(policies[0]), normalized(approved[0]), 'Editorial reviewers differ from the approved Astro policy');
}
function verifyBuild() {
  execFileSync(process.execPath, ['scripts/verify-editorial-preview.mjs', branch, revision], {stdio:'inherit'});
}
verifyBuild();
await verifyAccess();
assert.equal((await api('/workers/subdomain')).subdomain, 'openstack-review');
const scripts = await api('/workers/scripts');
assert.equal(scripts.find(s=>s.id===worker)?.tag, workerId);
const upload = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'versions', 'upload', '--config', 'dist/server/wrangler.editorial.json', '--preview-alias', alias, '--tag', revision.slice(0,8), '--message', `${branch} at ${revision}`], {encoding:'utf8',maxBuffer:32*1024*1024});
const log = `${upload.stdout || ''}\n${upload.stderr || ''}`;
writeFileSync('dist/editorial-upload.log', log, {mode:0o600});
assert.equal(upload.status, 0, 'Version upload failed; inspect ignored dist/editorial-upload.log');
const version = log.match(/Worker Version ID:\s*([a-f0-9-]{36})/)?.[1];
assert.ok(version, 'Upload response did not identify a version');
const host = prefix => `https://${prefix}-${worker}.openstack-review.workers.dev`;
const url = host(version.split('-')[0]);
const aliasUrl = host(alias);
verifyBuild();
await verifyAccess();
await api(`/workers/scripts/${worker}/subdomain`, false, {enabled:false,previews_enabled:true});
try {
  for (const origin of [url, aliasUrl]) {
    for (const path of ['/', '/cms-proof/', '/admin/', '/images/openstack-logo.svg', '/api/cms/media']) {
      const response = await fetch(origin+path, {redirect:'manual',signal:AbortSignal.timeout(20000)});
      assert.ok([302,303,307].includes(response.status), `Access challenge missing: ${origin}${path}`);
      const login = new URL(response.headers.get('location'));
      assert.equal(login.hostname, 'calm-wind-c20f.cloudflareaccess.com');
      assert.ok(login.pathname.startsWith('/cdn-cgi/access/login/'));
    }
  }
  verifyBuild();
} catch (error) {
  await api(`/workers/scripts/${worker}/subdomain`, false, {enabled:false,previews_enabled:false});
  throw error;
}
const publication = {schemaVersion:1,branch,revision,worker,version,url,aliasUrl,accessApplication:app,verifiedAt:new Date().toISOString()};
writeFileSync('dist/editorial-publication.json', JSON.stringify(publication,null,2)+'\n');
console.log(`Protected editorial preview: ${url}\nRevision: ${revision}`);
