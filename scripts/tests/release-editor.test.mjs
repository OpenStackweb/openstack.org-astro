import test from 'node:test';
import assert from 'node:assert/strict';
import { createForm } from 'final-form';
import { readFileSync, readdirSync } from 'node:fs';
import { releaseAnnouncement } from '../../tina/schema/releases.ts';
import {
  prepareReleaseAnnouncement,
  releaseEditorContent,
} from '../../src/lib/server/release-announcements.mjs';

const records = readdirSync('src/lib/content/releases')
  .filter((name) => name.endsWith('.json'))
  .map((filename) => ({
    filename,
    content: JSON.parse(readFileSync(`src/lib/content/releases/${filename}`, 'utf8')),
  }));
const submit = (values, initialValues = {}) =>
  releaseAnnouncement.ui.beforeSubmit({ values, form: { initialValues } });

test('slug field explains invalid edits before submission and recovers when restored', () => {
  const validate = releaseAnnouncement.fields.find((field) => field.name === 'slug').ui.validate;
  assert.equal(validate('new-cycle', {}, {}), undefined);
  assert.match(validate('renamed', {}, { initial: 'gazpacho' }), /saved release slug unchanged/);
  assert.match(validate('UPPER', {}, {}), /lowercase/);
  assert.equal(validate('gazpacho', {}, { initial: 'gazpacho' }), undefined);
});

test('installed Final Form supplies the saved slug and blocks then recovers invalid edits', () => {
  const validate = releaseAnnouncement.fields.find((field) => field.name === 'slug').ui.validate;
  const form = createForm({ onSubmit: () => {}, initialValues: { slug: 'gazpacho' } });
  const unsubscribe = form.registerField(
    'slug',
    () => {},
    { value: true, error: true },
    {
      getValidator: () => validate,
    },
  );
  form.change('slug', 'renamed');
  assert.equal(form.getState().invalid, true);
  assert.match(form.getFieldState('slug').error, /Restore its original value/);
  form.change('slug', 'gazpacho');
  assert.equal(form.getState().invalid, false);
  assert.equal(form.getFieldState('slug').error, undefined);
  unsubscribe();
});

test('unpublished announcement previews require explicit opt-in and safe document names', () => {
  assert.throws(() => releaseEditorContent('new-cycle', undefined), /not published/);
  for (const filename of ['../secret', 'new/child', 'quote"', ''])
    assert.throws(() => releaseEditorContent(filename, undefined, true), /slug/);
  const draft = releaseEditorContent('new-cycle', undefined, true);
  assert.equal(draft.slug, 'new-cycle');
  assert.equal(draft.title, 'Unpublished release announcement');
  assert.doesNotThrow(() => prepareReleaseAnnouncement(draft));
});

test('preview loading preserves existing content and points the CMS to a stable preview route', () => {
  const content = records[0].content;
  assert.equal(releaseEditorContent(content.slug, content, true), content);
  assert.equal(
    releaseAnnouncement.ui.router({ document: { _sys: { filename: 'new-cycle' } } }),
    '/cms-preview/release/new-cycle',
  );
});

test('all published announcements preserve every field and contributor order through the submit hook', async () => {
  const fields = new Set(releaseAnnouncement.fields.map((field) => field.name));
  for (const { filename, content } of records) {
    assert.equal(filename, `${content.slug}.json`);
    assert.deepEqual(
      Object.keys(content).filter((name) => !fields.has(name)),
      [],
    );
    assert.deepEqual(await submit(structuredClone(content), content), content);
    assert.deepEqual(prepareReleaseAnnouncement(content).contributors, content.contributors);
  }
});

test('existing slugs cannot change, but new announcements can choose a valid slug', async () => {
  const original = records[0].content;
  await assert.rejects(submit({ ...original, slug: 'new-release' }, original), /unchanged/);
  assert.equal((await submit({ ...original, slug: 'new-release' })).slug, 'new-release');
  for (const slug of ['../admin', 'UPPER', 'has space', ''])
    await assert.rejects(submit({ ...original, slug }), /lowercase/);
});

test('clearing optional announcement copy preserves explicit empty values', async () => {
  const { slug, title } = records[0].content;
  const result = await submit({ slug, title });
  assert.equal(result.description, '');
  assert.equal(result.body, '');
  assert.equal(result.contributorIntroduction, '');
  assert.deepEqual(result.contributors, []);
  assert.doesNotThrow(() => prepareReleaseAnnouncement(result));
});

test('invalid titles and contributor payloads cannot be saved', async () => {
  await assert.rejects(submit({ ...records[0].content, title: ' ' }), /headline/);
  for (const contributors of [{ name: 'not a list' }, [12], ['x'.repeat(251)]])
    await assert.rejects(submit({ ...records[0].content, contributors }), /Contributor/);
});

test('generated Tina contract covers the release collection and keeps catalogue records separate', () => {
  const lock = JSON.parse(readFileSync('tina/tina-lock.json', 'utf8'));
  const collection = lock.schema.collections.find(
    (value) => value.name === releaseAnnouncement.name,
  );
  assert.ok(collection);
  assert.equal(collection.path, 'src/lib/content/releases');
  const contract = (fields) =>
    fields.map(({ name, type, list, required }) => ({
      name,
      type,
      list: !!list,
      required: !!required,
    }));
  assert.deepEqual(contract(collection.fields), contract(releaseAnnouncement.fields));
  assert.equal(
    collection.fields.some((field) =>
      ['status', 'release_number', 'components'].includes(field.name),
    ),
    false,
  );
});

test('Git release registry rejects duplicate routes and filename drift', async () => {
  const { validateReleaseRegistry } = await import('../lib/release-registry.mjs');
  const entries = records.map(({ filename, content }) => [filename, content]);
  assert.deepEqual(
    validateReleaseRegistry(entries),
    records.map((row) => row.content),
  );
  const content = structuredClone(records[0].content);
  assert.throws(() => validateReleaseRegistry([['different.json', content]]), /filename.*match/);
  assert.throws(
    () =>
      validateReleaseRegistry([
        [`${content.slug}.json`, content],
        ['duplicate.json', structuredClone(content)],
      ]),
    /Duplicate.*route/,
  );
  assert.throws(
    () => validateReleaseRegistry([[`${content.slug}.json`, { ...content, title: ' ' }]]),
    /headline/,
  );
  assert.equal(validateReleaseRegistry([]).length, 0);
});
