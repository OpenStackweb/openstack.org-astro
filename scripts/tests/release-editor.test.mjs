import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { releaseAnnouncement } from '../../tina/schema/releases.ts';
import { prepareReleaseAnnouncement, releaseEditorContent } from '../../src/lib/server/release-announcements.mjs';

const records = readdirSync('src/lib/content/releases').filter(name => name.endsWith('.json'))
  .map(filename => ({ filename, content: JSON.parse(readFileSync(`src/lib/content/releases/${filename}`, 'utf8')) }));
const submit = (values, initialValues = {}) => releaseAnnouncement.ui.beforeSubmit({ values, form: { initialValues } });

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
  assert.equal(releaseAnnouncement.ui.router({ document: { _sys: { filename: 'new-cycle' } } }), '/cms-preview/release?document=new-cycle');
});

test('all published announcements preserve every field and contributor order through the submit hook', async () => {
  const fields = new Set(releaseAnnouncement.fields.map(field => field.name));
  for (const { filename, content } of records) {
    assert.equal(filename, `${content.slug}.json`);
    assert.deepEqual(Object.keys(content).filter(name => !fields.has(name)), []);
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
  const collection = lock.schema.collections.find(value => value.name === releaseAnnouncement.name);
  assert.ok(collection);
  assert.equal(collection.path, 'src/lib/content/releases');
  const contract = fields => fields.map(({ name, type, list, required }) => ({ name, type, list: !!list, required: !!required }));
  assert.deepEqual(contract(collection.fields), contract(releaseAnnouncement.fields));
  assert.equal(collection.fields.some(field => ['status', 'release_number', 'components'].includes(field.name)), false);
});
