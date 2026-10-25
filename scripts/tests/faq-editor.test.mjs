import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareEditorialPage } from '../../src/lib/server/editorial.mjs';
import { validateFaqSubmission } from '../../tina/faq-validation.mjs';
const page = JSON.parse(
  readFileSync(
    new URL('../../src/lib/content/pages/shanghai-2019-faq.json', import.meta.url),
    'utf8',
  ),
);
test('Published FAQ answers remain searchable and sanitized without changing source records', () => {
  const original = JSON.stringify(page);
  validateFaqSubmission(page.faq);
  const prepared = prepareEditorialPage(page);
  assert.equal(prepared.faq.categories.flatMap((c) => c.questions).length, 12);
  assert.match(prepared.faq.categories[0].questions[0].searchText, /shanghai/);
  const unsafe = structuredClone(page);
  unsafe.faq.categories[0].questions[0].answer = '<script>alert(1)</script><p>Updated answer</p>';
  assert.equal(
    prepareEditorialPage(unsafe).faq.categories[0].questions[0].html,
    '<p>Updated answer</p>',
  );
  assert.equal(JSON.stringify(page), original);
});
test('Incomplete FAQ drafts preview without silently becoming publishable', () => {
  const draft = structuredClone(page);
  draft.faq.categories.push({ id: '', title: '', questions: [{ question: '', answer: null }] });
  const preview = prepareEditorialPage(draft, { draft: true });
  assert.equal(preview.faq.categories.at(-1).questions[0].question, 'Untitled question');
  assert.throws(() => validateFaqSubmission(draft.faq), /unique lowercase anchor/);
  const last = draft.faq.categories.at(-1);
  last.id = 'new-topic';
  last.title = 'New topic';
  assert.throws(() => validateFaqSubmission(draft.faq), /Question is required/);
  last.questions[0] = { question: 'A question?', answer: 'An answer.' };
  validateFaqSubmission(draft.faq);
  last.id = draft.faq.categories[0].id;
  assert.throws(() => validateFaqSubmission(draft.faq), /unique lowercase anchor/);
});
test('An explicitly empty FAQ survives Tina optional-list nulls', () => {
  const empty = structuredClone(page);
  empty.body = null;
  empty.faq.categories = null;
  validateFaqSubmission(empty.faq);
  assert.deepEqual(prepareEditorialPage(empty).faq.categories, []);
  assert.equal(prepareEditorialPage(empty).html, '');
  empty.faq.categories = [{ id: 'topic', title: 'Topic', questions: null }];
  validateFaqSubmission(empty.faq);
  assert.deepEqual(prepareEditorialPage(empty).faq.categories[0].questions, []);
});

test('FAQ editor field contract matches the generated Tina schema', async () => {
  const { faqField } = await import('../../tina/schema/faq.ts');
  const lock = JSON.parse(
    readFileSync(new URL('../../tina/tina-lock.json', import.meta.url), 'utf8'),
  );
  const fields = lock.schema.collections.find((c) => c.name === 'editorial').fields;
  const shape = (field) => ({
    name: field.name,
    type: field.type,
    required: Boolean(field.required),
    list: Boolean(field.list),
    ...(field.fields ? { fields: field.fields.map(shape) } : {}),
  });
  assert.deepEqual(shape(faqField), shape(fields.find((f) => f.name === 'faq')));
  assert.equal(
    Boolean(fields.find((f) => f.name === 'body').required),
    false,
    'Structured FAQ pages may have an empty page body',
  );
});
