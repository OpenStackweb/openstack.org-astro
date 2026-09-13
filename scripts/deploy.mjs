import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const config = JSON.parse(await readFile('dist/server/wrangler.json','utf8'));
assert.ok(!config.vars?.CMS_LOCAL_TEST, 'Local test authorization must never be deployed.');
try {
  const admin = await readFile('dist/client/admin/index.html', 'utf8');
  assert.ok(!/localhost:4001|127\.0\.0\.1:4001/.test(admin), 'Refusing to deploy the local Tina editor.');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
assert.equal(config.name,'openstack-org-astro');
assert.equal(config.account_id,'2f794481bbde50a491af00a5766012a7');
assert.equal(config.workers_dev,false);
assert.equal(config.preview_urls,false);
assert.ok(!config.routes?.length, 'Hostname attachment is separately managed; no route changes during deploy.');
assert.deepEqual(config.r2_buckets.map(row => [row.binding,row.bucket_name]),[['MEDIA','openstack-org-beta-media']]);
for (const path of ['/', '/software/', '/assets/openstack-map/openstack-map-v20260401.pdf', '/admin/', '/_astro/probe.js']) {
  const response = await fetch('https://astro.openstack.org'+path,{redirect:'manual'});
  assert.ok([302,303,307].includes(response.status),`Access challenge missing at ${path}`);
  const login = new URL(response.headers.get('location'));
  assert.equal(login.hostname,'calm-wind-c20f.cloudflareaccess.com');
  assert.ok(login.pathname.startsWith('/cdn-cgi/access/login/'));
}
const run = spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--config','dist/server/wrangler.json'],{stdio:'inherit'});
process.exit(run.status ?? 1);
