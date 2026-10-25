import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { latestReleasePath } from '../../src/lib/server/latest-release.mjs';

const slugs = readdirSync('src/lib/content/releases')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(`src/lib/content/releases/${name}`, 'utf8')).slug);
const home = JSON.parse(readFileSync('src/lib/content/home.json', 'utf8'));

test('the homepage latest-release choice resolves to a published announcement', () => {
  assert.match(
    latestReleasePath(home.latestRelease.cta1_link, slugs),
    /^\/software\/openstack-[a-z0-9-]+\/$/,
  );
});

test('supported site origins normalize to the same local announcement', () => {
  for (const origin of [
    '',
    'https://www.openstack.org',
    'https://openstack.org',
    'https://beta.openstack.org',
    'https://astro.openstack.org',
  ])
    assert.equal(
      latestReleasePath(`${origin}/software/openstack-${slugs[0]}`, slugs),
      `/software/openstack-${slugs[0]}/`,
    );
});

test('latest-release rejects external, unpublished, credentialed and looping destinations', () => {
  for (const link of [
    '',
    '/latest-release/',
    '/software/openstack-not-published/',
    `https://example.org/software/openstack-${slugs[0]}/`,
    `https://user@www.openstack.org/software/openstack-${slugs[0]}/`,
    `https://www.openstack.org:8443/software/openstack-${slugs[0]}/`,
    `/software/openstack-${slugs[0]}/?redirect=elsewhere`,
    `/software/openstack-${slugs[0]}/#section`,
    'javascript:alert(1)',
  ])
    assert.throws(() => latestReleasePath(link, slugs));
});
