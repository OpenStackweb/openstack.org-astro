import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import {
  assessPreviewPull,
  previewRepository,
  previewContentPath,
  pullPreviewBranch,
  validPullNumber,
  validRevision,
} from '../src/lib/server/pr-preview-policy.mjs';

const number = process.env.PREVIEW_PR;
const head = process.env.PREVIEW_HEAD;
const base = process.env.PREVIEW_BASE;
assert.ok(validPullNumber(number) && validRevision(head) && validRevision(base), 'Invalid request');
assert.ok(process.env.GH_TOKEN, 'Workflow token required');
const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
const github = async (path, body) => {
  const response = await fetch(`https://api.github.com/repos/${previewRepository}${path}`, {
    method: body ? 'POST' : 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `GitHub request failed (${response.status})`);
  return response.status === 204 ? null : response.json();
};
const [pull, files, main] = await Promise.all([
  github(`/pulls/${number}`),
  github(`/pulls/${number}/files?per_page=100`),
  github('/commits/main'),
]);
assert.equal(assessPreviewPull(pull, files), null, 'PR is not an eligible content-only change');
assert.equal(pull.head.sha, head, 'PR changed since the preview request');
assert.equal(main.sha, base, 'Main changed since the preview request');
assert.equal(git('rev-parse', 'HEAD'), base, 'Workflow must run trusted current main');
assert.equal(git('status', '--porcelain'), '', 'Clean checkout required');
const branch = pullPreviewBranch(number, head, base);
// Fetch through the upstream PR ref. Never run commands, hooks or dependency installers from the fork.
git('fetch', 'origin', `refs/pull/${number}/head`);
assert.equal(git('rev-parse', 'FETCH_HEAD'), head);
const common = git('merge-base', base, head);
const paths = git('diff', '--name-only', '--no-renames', common, head).split('\n').filter(Boolean);
assert.ok(
  paths.length > 0 && paths.length <= 100 && paths.every(previewContentPath),
  'Unexpected changed paths',
);
let total = 0;
for (const path of paths) {
  const entry = git('ls-tree', head, '--', path);
  if (!entry) continue; // Content deletion is permitted; rendering and validation must still pass.
  assert.ok(entry.startsWith('100644 blob '), 'Only ordinary JSON files are allowed');
  const size = Number(git('cat-file', '-s', `${head}:${path}`));
  total += size;
  assert.ok(size <= 1024 * 1024 && total <= 8 * 1024 * 1024, 'Content size limit exceeded');
  JSON.parse(git('show', `${head}:${path}`));
}
git('config', 'user.name', 'OpenStack preview builder');
git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
// A real merge detects conflicts instead of overwriting newer main content.
git(
  '-c',
  'core.hooksPath=/dev/null',
  '-c',
  'merge.renames=false',
  'merge',
  '--no-commit',
  '--no-ff',
  head,
);
const staged = git('diff', '--cached', '--name-only', '--no-renames').split('\n').filter(Boolean);
assert.ok(
  staged.length > 0 && staged.every(previewContentPath),
  'Merge changed a non-content path',
);
// Recheck the request immediately before publishing its isolated branch.
const latest = await github(`/pulls/${number}`);
assert.equal(latest.state, 'open');
assert.equal(latest.head.sha, head, 'PR changed during preparation');
assert.equal((await github('/commits/main')).sha, base, 'Main changed during preparation');
git('config', 'user.name', 'OpenStack preview builder');
git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
git('-c', 'core.hooksPath=/dev/null', 'commit', '-m', `Prepare preview of PR #${number} (${head})`);
let revision = git('rev-parse', 'HEAD');
const existing = git('ls-remote', '--heads', 'origin', `refs/heads/${branch}`).split(/\s/)[0];
if (existing) {
  // A retry may reuse a branch only if its exact tree and parents match this prepared merge.
  git('fetch', 'origin', `refs/heads/${branch}`);
  assert.equal(git('rev-parse', 'FETCH_HEAD^{tree}'), git('rev-parse', 'HEAD^{tree}'));
  assert.equal(
    git('show', '-s', '--format=%P', 'FETCH_HEAD'),
    git('show', '-s', '--format=%P', 'HEAD'),
  );
  revision = git('rev-parse', 'FETCH_HEAD');
} else {
  git('push', 'origin', `HEAD:refs/heads/${branch}`);
}
await github('/actions/workflows/editorial-preview.yml/dispatches', {
  ref: 'main',
  inputs: { branch, revision },
});
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### PR #${number} preview requested\n\nSource: ${head}\n\nBase: ${base}\n\nInternal branch: ${branch}\n\n[Check protected preview](https://astro.openstack.org/review/branch/?branch=${encodeURIComponent(branch)})\n\nThe contributor's branch and production content were not changed.\n`,
  );
console.log(`Prepared PR #${number} as ${branch} at ${revision}; preview build requested.`);
