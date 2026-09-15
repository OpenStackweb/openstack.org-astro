// Only the reviewed image manifest is eligible. Three independent uploads at a time.
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import useCaseManifest from '../docs/use-case-image-assets.json' with { type: 'json' };
import bostonManifest from '../docs/boston-city-guide-images.json' with { type: 'json' };
import marketingManifest from '../docs/marketing-design-assets.json' with { type: 'json' };
import appdevManifest from '../docs/appdev-image-assets.json' with { type: 'json' };
import edgeManifest from '../docs/edge-background-assets.json' with { type: 'json' };
assert.ok(!process.argv[3] || ['--boston-guide', '--appdev', '--marketing-designs', '--edge-background'].includes(process.argv[3]), 'Unknown reviewed manifest');
const manifest = process.argv[3] === '--edge-background' ? edgeManifest
  : process.argv[3] === '--marketing-designs' ? marketingManifest
  : process.argv[3] === '--boston-guide' ? bostonManifest
  : process.argv[3] === '--appdev' ? appdevManifest : useCaseManifest;
const directory = process.argv[2];
assert.ok(directory, 'Provide the reviewed image directory');
const verification = resolve(directory, 'r2-verified');
await mkdir(verification, { recursive: true });
const command = (action, key, args) => new Promise((resolveResult, reject) => {
  const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'r2', 'object', action,
    `openstack-org-beta-media/legacy/${key}`, '--remote', '--profile', 'openinfra', ...args], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  child.on('error', reject);
  child.on('close', status => resolveResult({ status, output }));
});
const verify = async (file, entry) => {
  const bytes = await readFile(file);
  assert.equal(bytes.length, entry.bytes, 'Image size mismatch');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, 'Image checksum mismatch');
  if (entry.contentType === 'image/png') assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  else if (entry.contentType === 'application/postscript') { assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); }
  else { assert.equal(entry.contentType, 'image/jpeg'); assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff'); }
};
const entries = [...new Map(manifest.assets.map(entry => [entry.sha256, entry])).values()];
let cursor = 0;
let failed = false;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (!failed && cursor < entries.length) {
    const entry = entries[cursor++];
    try {
      assert.match(entry.sha256, /^[a-f0-9]{64}$/);
      assert.match(entry.filename, /^(?:[a-f0-9]{64}\.(?:png|jpg)|OpenStack-(?:Sticker|Hoodie)\.ai)$/);
      assert.ok(entry.bytes > 0 && entry.bytes < 64 * 1024 * 1024);
      const source = resolve(directory, entry.filename);
      const destination = resolve(verification, entry.sha256);
      await verify(source, entry);
      const existing = await command('get', entry.sha256, ['--file', destination]);
      let status = 'reused';
      if (existing.status !== 0) {
        assert.ok(existing.output.includes('The specified key does not exist.'), `R2 read failed for ${entry.path}`);
        const upload = await command('put', entry.sha256, ['--file', source, '--content-type', entry.contentType]);
        assert.equal(upload.status, 0, `R2 upload failed for ${entry.path}`);
        const download = await command('get', entry.sha256, ['--file', destination]);
        assert.equal(download.status, 0, `R2 verification failed for ${entry.path}`);
        status = 'uploaded';
      }
      await verify(destination, entry);
      console.log(JSON.stringify({ path: entry.path, status, verified: true }));
    } catch (error) {
      failed = true;
      process.exitCode = 1;
      console.error(error.message);
    }
  }
}));
