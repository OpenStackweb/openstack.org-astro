import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseDocument, DomUtils as D } from 'htmlparser2';
import {
  historicalReleaseFor,
  historicalReleasePaths,
} from '../../src/lib/server/historical-releases.mjs';
import { mediaKey } from '../../src/lib/server/media-assets.mjs';
const registry = JSON.parse(
  await readFile(new URL('../../src/lib/content/media.json', import.meta.url)),
);
const text = (html) => D.textContent(parseDocument(html)).replace(/\s+/g, ' ').trim();

test('historical release rendering retains editorial text and registered image links', () => {
  for (const path of historicalReleasePaths) {
    const page = historicalReleaseFor(path);
    assert.equal(
      text(page.html),
      text(page.body),
      `${path}: editorial text lost during sanitization`,
    );
    const elements = D.findAll(() => true, parseDocument(page.html).children);
    assert.ok(!elements.some((e) => ['script', 'form', 'iframe', 'h1'].includes(e.name)), path);
    for (const node of elements) {
      const value =
        node.name === 'img'
          ? node.attribs.src
          : node.name === 'a' && /\.(png|jpe?g)$/i.test(node.attribs.href || '')
            ? node.attribs.href
            : null;
      if (!value) continue;
      assert.ok(
        registry[mediaKey(new URL(value, 'https://www.openstack.org').pathname)],
        `${path}: unsupported image route ${value}`,
      );
    }
  }
});

test('historical routes do not take ownership of catalogue, current releases or arbitrary slugs', () => {
  for (const path of [
    '/software/',
    '/software/openstack-gazpacho/',
    '/software/project-navigator/openstack-components/',
    '/software/releases/dalmatian/components/nova',
    '/software/not-a-release/',
  ]) {
    assert.equal(historicalReleaseFor(path), null, path);
  }
});
