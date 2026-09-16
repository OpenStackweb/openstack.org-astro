// Upload only checksummed public PDFs from one of the reviewed manifests.
// Existing objects must match; never overwrite a conflicting object.
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import summitManifest from '../docs/summit-pdf-assets.json' with { type: 'json' };
import sponsorManifest from '../docs/archive-sponsor-assets.json' with { type: 'json' };
import austinManifest from '../docs/austin-pdf-assets.json' with { type: 'json' };
import opendevManifest from '../docs/opendev-sponsor-assets.json' with { type: 'json' };
import coaManifest from '../docs/coa-handbook-assets.json' with { type: 'json' };
import releaseMapManifest from '../docs/release-map-assets.json' with { type: 'json' };

import sampleManifest from '../docs/software-sample-pdf-assets.json' with { type: 'json' };

const manifests = { '--sponsor-archives': sponsorManifest, '--austin-archives': austinManifest, '--opendev-archive': opendevManifest, '--coa-handbook': coaManifest, '--release-map': releaseMapManifest, '--software-samples': sampleManifest };
assert.ok(!process.argv[3] || Object.hasOwn(manifests, process.argv[3]), 'Unknown reviewed manifest');
const manifest = process.argv[3] ? manifests[process.argv[3]] : summitManifest;

const directory = process.argv[2];
assert.ok(directory, 'Provide the private directory containing the reviewed PDF files');
const verification = resolve(directory, 'r2-verified');
await mkdir(verification, { recursive: true });
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const command = (action, key, args) => spawnSync(process.execPath, [
  'node_modules/wrangler/bin/wrangler.js', 'r2', 'object', action,
  `openstack-org-beta-media/legacy/${key}`, '--remote', '--profile', 'openinfra', ...args,
], { encoding: 'utf8', timeout: 120000 });
const verify = async (file, entry) => {
  const bytes = await readFile(file);
  assert.equal(bytes.length, entry.bytes, 'PDF size mismatch');
  assert.equal(digest(bytes), entry.sha256, 'PDF checksum mismatch');
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
};
for (const entry of manifest.assets) {
  assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  assert.match(entry.filename, /^[a-zA-Z0-9_.-]+\.pdf$/);
  assert.ok(entry.bytes > 0 && entry.bytes < 64 * 1024 * 1024);
  const source = resolve(directory, entry.filename);
  await verify(source, entry);
  const destination = resolve(verification, entry.sha256);
  const existing = command('get', entry.sha256, ['--file', destination]);
  let status = 'reused';
  if (existing.status !== 0) {
    assert.ok((existing.stdout + existing.stderr).includes('The specified key does not exist.'),
      `R2 read failed for ${entry.filename}; upload aborted`);
    const uploaded = command('put', entry.sha256, ['--file', source, '--content-type', 'application/pdf', '--content-disposition', 'inline']);
    assert.equal(uploaded.status, 0, `R2 upload failed for ${entry.filename}`);
    const downloaded = command('get', entry.sha256, ['--file', destination]);
    assert.equal(downloaded.status, 0, `R2 verification download failed for ${entry.filename}`);
    status = 'uploaded';
  }
  await verify(destination, entry);
  console.log(JSON.stringify({ filename: entry.filename, sha256: entry.sha256, status, verified: true }));
}
