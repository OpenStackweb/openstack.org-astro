import assert from 'node:assert/strict';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

export async function fingerprintEditorialOutput(root = '.') {
  async function walk(directory) {
    const rows = [];
    for (const entry of (await readdir(join(root, directory))).sort()) {
      const path = `${directory}/${entry}`;
      const stat = await lstat(join(root, path));
      assert.ok(!stat.isSymbolicLink(), `Unexpected symlink in preview output: ${path}`);
      if (stat.isDirectory()) rows.push(...await walk(path));
      else if (stat.isFile()) rows.push({ path, sha256: createHash('sha256').update(await readFile(join(root, path))).digest('hex') });
      else throw new Error(`Unsupported preview output: ${path}`);
    }
    return rows;
  }
  return [...await walk('dist/client'), ...await walk('dist/server')];
}

export async function verifyEditorialArtifact({ branch, revision, root = '.' }) {
  const manifest = JSON.parse(await readFile(join(root, 'dist/editorial-preview-manifest.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.branch, branch);
  assert.equal(manifest.tinaBranch, branch);
  assert.equal(manifest.revision, revision);
  assert.equal(manifest.worker, 'openstack-org-astro-editorial');
  assert.equal(manifest.publication, 'not-uploaded');
  assert.deepEqual(await fingerprintEditorialOutput(root), manifest.files, 'Preview output changed since build');
  return manifest;
}
