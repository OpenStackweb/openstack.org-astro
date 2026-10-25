import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  beforeHomepageSubmit,
  publishedReleaseChoices,
} from '../../tina/home-release-validation.mjs';

const home = JSON.parse(readFileSync('src/lib/content/home.json', 'utf8'));
const choices = readdirSync('src/lib/content/releases')
  .filter((name) => name.endsWith('.json'))
  .map((name) => {
    const { slug, title } = JSON.parse(readFileSync(`src/lib/content/releases/${name}`, 'utf8'));
    return { slug, title, path: `/software/openstack-${slug}/` };
  });
const fetcher = async (url, options) => {
  assert.equal(url, '/api/cms/releases');
  assert.equal(options.cache, 'no-store');
  return Response.json(choices);
};

test('homepage submit checks the published selection without rewriting other content', async () => {
  assert.equal(await beforeHomepageSubmit({ values: home }, fetcher), home);
  const changed = structuredClone(home);
  changed.latestRelease.cta1_link = choices[0].path;
  assert.equal(await beforeHomepageSubmit({ values: changed }, fetcher), changed);
});

test('unpublished and external homepage selections cannot pass the save hook', async () => {
  for (const link of [
    '/software/openstack-not-deployed/',
    'https://example.org/',
    '',
    '/latest-release/',
  ]) {
    const values = structuredClone(home);
    values.latestRelease.cta1_link = link;
    await assert.rejects(beforeHomepageSubmit({ values }, fetcher));
  }
});

test('failed or malformed announcement lookup fails the save instead of accepting a stale guess', async () => {
  await assert.rejects(
    beforeHomepageSubmit({ values: home }, async () => new Response('', { status: 503 })),
    /sign-in or error page/,
  );
  for (const rows of [
    [],
    {},
    [choices[0], choices[0]],
    [{ ...choices[0], path: 'https://example.org' }],
  ])
    await assert.rejects(
      publishedReleaseChoices(async () => Response.json(rows)),
      /invalid/,
    );
});
