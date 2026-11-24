import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { previewRepository, pullPreviewBranch } from '../../src/lib/server/pr-preview-policy.mjs';
const script = resolve('scripts/prepare-pr-preview.mjs');
function fixture(mode = 'content') {
  const root = mkdtempSync(join(tmpdir(), 'openstack-pr-preview-'));
  const remote = join(root, 'remote.git'),
    work = join(root, 'work');
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: work,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  execFileSync('git', ['init', '--bare', remote], { stdio: 'ignore' });
  execFileSync('git', ['clone', remote, work], { stdio: 'ignore' });
  git('checkout', '-b', 'main');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.invalid');
  const path = 'src/lib/content/community.json';
  mkdirSync(join(work, 'src/lib/content'), { recursive: true });
  writeFileSync(join(work, path), '{}');
  git('add', '.');
  git('commit', '-m', 'Base');
  git('push', 'origin', 'main');
  const base = git('rev-parse', 'HEAD');
  git('checkout', '-b', 'fork');
  if (mode === 'symlink') {
    rmSync(join(work, path));
    symlinkSync('/etc/passwd', join(work, path));
  } else writeFileSync(join(work, path), '{"title":"Proposed content"}');
  const files = [{ filename: path }];
  if (mode === 'code') {
    writeFileSync(
      join(work, 'package.json'),
      '{"scripts":{"postinstall":"touch /tmp/should-not-run"}}',
    );
    files.push({ filename: 'package.json' });
  }
  git('add', '.');
  git('commit', '-m', 'Proposal');
  const head = git('rev-parse', 'HEAD');
  git('push', 'origin', `HEAD:refs/pull/57/head`);
  git('checkout', 'main');
  const pull = {
    state: 'open',
    changed_files: files.length,
    head: { sha: head },
    base: { ref: 'main', repo: { full_name: previewRepository } },
  };
  const mockPath = join(root, 'mock.mjs'),
    dispatch = join(root, 'dispatch.json');
  writeFileSync(
    mockPath,
    `import {writeFileSync} from 'node:fs';
    globalThis.fetch=async(url,init)=>{
      if(url.endsWith('/dispatches')){writeFileSync(${JSON.stringify(dispatch)},init.body);return new Response(null,{status:204});}
      if(url.includes('/files?'))return Response.json(${JSON.stringify(files)});
      if(url.endsWith('/pulls/57'))return Response.json(${JSON.stringify(pull)});
      if(url.endsWith('/commits/main'))return Response.json({sha:${JSON.stringify(base)}});
      throw Error('Unexpected network call');
    };`,
  );
  const run = () =>
    spawnSync(process.execPath, ['--import', mockPath, script], {
      cwd: work,
      encoding: 'utf8',
      env: {
        ...process.env,
        GH_TOKEN: 'test-only',
        PREVIEW_PR: '57',
        PREVIEW_HEAD: head,
        PREVIEW_BASE: base,
      },
    });
  return { root, work, git, base, head, dispatch, run };
}
test('real git preparation preserves main, builds a separate merge, and reuses it on retry', () => {
  const f = fixture();
  try {
    const first = f.run();
    assert.equal(first.status, 0, first.stderr);
    const branch = pullPreviewBranch(57, f.head, f.base);
    const payload = JSON.parse(readFileSync(f.dispatch));
    assert.equal(payload.ref, 'main');
    assert.equal(payload.inputs.branch, branch);
    assert.equal(f.git('rev-parse', 'origin/main'), f.base);
    assert.equal(
      f.git('show', `${payload.inputs.revision}:src/lib/content/community.json`),
      '{"title":"Proposed content"}',
    );
    assert.equal(f.git('rev-parse', 'HEAD^2'), f.head);
    f.git('reset', '--hard', f.base);
    const retry = f.run();
    assert.equal(retry.status, 0, retry.stderr);
    assert.equal(JSON.parse(readFileSync(f.dispatch)).inputs.revision, payload.inputs.revision);
  } finally {
    rmSync(f.root, { recursive: true, force: true });
  }
});
test('fork code and symlink JSON are rejected before creating any preview branch', () => {
  for (const mode of ['code', 'symlink']) {
    const f = fixture(mode);
    try {
      assert.notEqual(f.run().status, 0);
      assert.equal(f.git('ls-remote', '--heads', 'origin', 'refs/heads/review/*'), '');
      assert.equal(f.git('rev-parse', 'HEAD'), f.base);
    } finally {
      rmSync(f.root, { recursive: true, force: true });
    }
  }
});
