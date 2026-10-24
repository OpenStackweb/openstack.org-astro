import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = (name) =>
  readFileSync(new URL(`../../.github/workflows/${name}.yml`, import.meta.url), 'utf8');
test('formatting is enforced by validation, not editorial previews or release workflows', () => {
  assert.match(workflow('validate'), /run: npm run format:check/);
  for (const name of ['editorial-preview', 'publish-preview']) {
    assert.doesNotMatch(workflow(name), /run:.*(?:format:check|prettier)/);
  }
});

test('editorial workflow does not require npm scripts absent from existing draft branches', () => {
  // The workflow is loaded from main, then checks out a pre-cleanup Tina branch.
  // Its package only promises the original check and build entrypoints.
  const existingDraftScripts = new Set(['check', 'build']);
  const commands = [...workflow('editorial-preview').matchAll(/run: npm run ([\w:-]+)/g)];
  for (const [, script] of commands) assert.ok(existingDraftScripts.has(script), script);
});
