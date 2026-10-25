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

const auditCommand = /\b(?:(?:npm|yarn|pnpm)\s+(?:run\s+)?(?:security:)?audit|audit-ci)\b/;
test('release and editorial preview workflows do not depend on live audit results', () => {
  for (const command of [
    'npm audit',
    'npm run security:audit',
    'yarn audit',
    'pnpm audit',
    'npx audit-ci',
  ]) {
    assert.match(command, auditCommand);
  }
  assert.match(workflow('validate'), /run: npm run security:audit/);
  for (const name of ['editorial-preview', 'publish-preview']) {
    assert.doesNotMatch(workflow(name), auditCommand);
  }
});

test('scheduled auditing is independent of the code validation job', () => {
  const source = workflow('validate');
  const [validation, audit] = source.split('\n  audit:\n');
  assert.ok(audit, 'Security audit must have its own job');
  assert.match(source, /schedule:\s*\n\s*- cron:/);
  assert.match(validation, /if: github.event_name != 'schedule'/);
  assert.doesNotMatch(validation, /security:audit|needs:/);
  assert.match(audit, /run: npm run security:audit/);
  assert.doesNotMatch(audit, /needs:|npm ci/);
  for (const command of ['npm run check', 'node --test', 'npm run build']) {
    assert.ok(validation.includes(command), command);
  }
});
