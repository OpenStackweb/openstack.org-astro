import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { verifyEditorialArtifact } from './lib/editorial-preview-artifact.mjs';

const [branch, revision, ...extra] = process.argv.slice(2);
assert.ok(
  branch && branch !== 'main' && !extra.length,
  'Usage: node scripts/verify-editorial-preview.mjs <editorial-branch> <full-commit-sha>',
);
assert.match(revision || '', /^[a-f0-9]{40}$/);
execFileSync('git', ['check-ref-format', '--branch', branch], { stdio: 'ignore' });
// Fixed remote: do not trust a caller-controlled origin for publication evidence.
const remote = execFileSync(
  'git',
  [
    'ls-remote',
    '--exit-code',
    'https://github.com/OpenStackweb/openstack.org-astro.git',
    `refs/heads/${branch}`,
  ],
  { encoding: 'utf8' },
).trim();
assert.equal(
  remote,
  `${revision}\trefs/heads/${branch}`,
  'Remote editorial branch changed since build',
);
const manifest = await verifyEditorialArtifact({ branch, revision });
console.log(
  `Verified ${manifest.files.length} output files for ${branch} @ ${revision}. No upload performed; Access protection remains a separate requirement.`,
);
