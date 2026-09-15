import { execFileSync } from 'node:child_process';
import { readFile, writeFile, readdir, lstat, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyEditorialRevision } from './lib/editorial-preview-revision.mjs';

const [branch, sha, ...extra] = process.argv.slice(2);
if (!branch || !sha || extra.length) throw new Error('Usage: node scripts/build-editorial-preview.mjs <local-branch> <full-commit-sha>');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
git('check-ref-format', '--branch', branch);
const verify = () => verifyEditorialRevision({
  branch, sha, head: git('rev-parse', 'HEAD'),
  branchSha: git('rev-parse', '--verify', `refs/heads/${branch}^{commit}`),
  origin: git('remote', 'get-url', 'origin'), dirty: git('status', '--porcelain'),
});
verify();
// A failed rebuild must never leave a previous revision looking upload-ready.
await rm('dist/editorial-preview-manifest.json', { force: true });
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, TINA_BRANCH: branch } });
verify();
execFileSync(process.execPath, ['scripts/prepare-editorial-preview.mjs'], { stdio: 'inherit' });

async function fingerprint(directory) {
  const rows = [];
  for (const entry of (await readdir(directory)).sort()) {
    const path = `${directory}/${entry}`;
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) throw new Error(`Unexpected symlink in preview output: ${path}`);
    if (stat.isDirectory()) rows.push(...await fingerprint(path));
    else if (stat.isFile()) rows.push({ path, sha256: createHash('sha256').update(await readFile(path)).digest('hex') });
  }
  return rows;
}
const files = [...await fingerprint('dist/client'), ...await fingerprint('dist/server')];
await writeFile('dist/editorial-preview-manifest.json', JSON.stringify({
  schemaVersion: 1, branch, revision: sha, builtAt: new Date().toISOString(),
  worker: 'openstack-org-astro-editorial', tinaBranch: branch,
  publication: 'not-uploaded', files,
}, null, 2) + '\n');
console.log(`Prepared exact-revision editorial build: ${branch} @ ${sha}. No upload performed.`);
