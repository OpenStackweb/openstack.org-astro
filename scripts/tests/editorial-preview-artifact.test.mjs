import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fingerprintEditorialOutput, verifyEditorialArtifact } from '../lib/editorial-preview-artifact.mjs';

test('artifact verification rejects modified, extra, missing and symlinked output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'editorial-artifact-'));
  try {
    await mkdir(join(root, 'dist/client'), { recursive: true });
    await mkdir(join(root, 'dist/server'));
    const file = join(root, 'dist/client/index.html');
    await writeFile(file, 'original');
    const input = { root, branch: 'cms/trial', revision: 'a'.repeat(40) };
    const manifest = { schemaVersion: 1, branch: input.branch, tinaBranch: input.branch, revision: input.revision, worker: 'openstack-org-astro-editorial', publication: 'not-uploaded', files: await fingerprintEditorialOutput(root) };
    await writeFile(join(root, 'dist/editorial-preview-manifest.json'), JSON.stringify(manifest));
    await verifyEditorialArtifact(input);
    await assert.rejects(verifyEditorialArtifact({ ...input, revision: 'b'.repeat(40) }));
    await writeFile(file, 'modified');
    await assert.rejects(verifyEditorialArtifact(input));
    await writeFile(file, 'original');
    const extra = join(root, 'dist/server/extra');
    await writeFile(extra, 'unexpected');
    await assert.rejects(verifyEditorialArtifact(input));
    await rm(extra);
    await rm(file);
    await assert.rejects(verifyEditorialArtifact(input));
    await symlink('/etc/hosts', file);
    await assert.rejects(verifyEditorialArtifact(input), /symlink/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
