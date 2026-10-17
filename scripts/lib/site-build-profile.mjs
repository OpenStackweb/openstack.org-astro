import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ASTRO_AUTH_ORIGIN, PRODUCTION_AUTH_ORIGIN } from '../../src/lib/auth/config.js';
import { fingerprintEditorialOutput } from './editorial-preview-artifact.mjs';

export function siteBuildProfile(name = 'review') {
  assert.ok(name === 'review' || name === 'production', 'Unknown site build profile');
  return Object.freeze({ name, site: name === 'review' ? ASTRO_AUTH_ORIGIN : PRODUCTION_AUTH_ORIGIN });
}

export async function fingerprintSiteBuild(root = '.') {
  // Derived target configs are verified separately; they must not alter the
  // identity of the compiled client/server output from which they are prepared.
  return (await fingerprintEditorialOutput(root)).filter(file =>
    !['dist/server/wrangler.production.json', 'dist/server/wrangler.editorial.json'].includes(file.path));
}

export function siteBuildStamp(name, files) {
  const profile = siteBuildProfile(name);
  assert.ok(files.some(file => file.path === 'dist/server/entry.mjs') &&
    files.some(file => file.path === 'dist/server/wrangler.json'), 'Compiled Worker output is incomplete');
  return { schemaVersion: 1, profile: profile.name, site: profile.site,
    files: structuredClone(files) };
}

export function assertSiteBuild(stamp, expected, files) {
  const profile = siteBuildProfile(expected);
  assert.equal(stamp.schemaVersion, 1, 'Unsupported site build record');
  assert.ok(stamp.profile === profile.name && stamp.site === profile.site,
    'Site build profile/origin does not match this target');
  assert.ok(JSON.stringify(stamp.files) === JSON.stringify(files),
    'Site build output changed after its profile was recorded');
}

export async function verifySiteBuild(expected, root = '.') {
  const [stampBytes, configBytes, files] = await Promise.all([
    readFile(join(root, 'dist/site-build-profile.json')),
    readFile(join(root, 'dist/server/wrangler.json')),
    fingerprintSiteBuild(root),
  ]);
  const stamp = JSON.parse(stampBytes);
  assertSiteBuild(stamp, expected, files);
  return { stamp, config: JSON.parse(configBytes) };
}
