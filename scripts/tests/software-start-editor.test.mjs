import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { softwareStart } from '../../tina/schema/software-start.ts';
import {
  prepareSoftwareStart,
  validateSoftwareStart,
} from '../../src/lib/server/software-start.mjs';
const content = JSON.parse(readFileSync('src/lib/content/software-start.json', 'utf8'));

test('Get Started schema preserves all existing editorial fields recursively', async () => {
  const check = (value, fields) => {
    for (const [key, entry] of Object.entries(value)) {
      const field = fields.find((field) => field.name === key);
      assert.ok(field, `Missing field ${key}`);
      if (field.type === 'object')
        for (const row of field.list ? entry : [entry]) check(row, field.fields);
    }
  };
  check(content, softwareStart.fields);
  assert.deepEqual(
    await softwareStart.ui.beforeSubmit({ values: structuredClone(content) }),
    content,
  );
});

test('cleared optional lists and incomplete drafts render without changing saved input', () => {
  const draft = structuredClone(content);
  draft.trySection.content = null;
  draft.learn.content[0].actions = null;
  const rendered = prepareSoftwareStart(draft);
  assert.deepEqual(rendered.trySection.content, []);
  assert.deepEqual(rendered.learn.content[0].actions, []);
  assert.equal(draft.trySection.content, null);
  assert.doesNotThrow(() => prepareSoftwareStart({}));
});

test('editor rejects incomplete cards and unsafe action destinations', () => {
  const draft = structuredClone(content);
  draft.trySection.content.push({ title: '' });
  assert.throws(() => validateSoftwareStart(draft), /heading/);
  draft.trySection.content.pop();
  draft.trySection.content[0].actions[0].url = 'javascript:alert(1)';
  assert.throws(() => validateSoftwareStart(draft), /destination/);
  const preview = prepareSoftwareStart(draft);
  assert.equal(preview.trySection.content[0].actions[0].url, '#');
  assert.equal(draft.trySection.content[0].actions[0].url, 'javascript:alert(1)');
});
