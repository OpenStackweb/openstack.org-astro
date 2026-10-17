import test from 'node:test';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { sitemapCandidate } from '../lib/sitemap-candidate.mjs';

const report = (urls) => ({
  candidateCount: urls.length,
  candidates: urls.map(url => ({ url })),
  held: [{ path: '/software/dev-only/' }],
});

test('preserves canonical translations, escapes XML and omits held routes and invented dates', () => {
  const xml = sitemapCandidate(report(['https://www.openstack.org/', 'https://www.openstack.org/paper/?lang=fr&edition=2']));
  assert.ok(xml.includes('?lang=fr&amp;edition=2'));
  assert.equal((xml.match(/<url>/g) || []).length, 2);
  assert.ok(!xml.includes('dev-only'));
  assert.ok(!xml.includes('lastmod'));
});

test('rejects duplicate, preview, credentialed and fragment URLs', () => {
  for (const urls of [
    ['https://www.openstack.org/', 'https://www.openstack.org/'],
    ['https://astro.openstack.org/'],
    ['https://user:password@www.openstack.org/'],
    ['https://www.openstack.org/#section'],
  ]) assert.throws(() => sitemapCandidate(report(urls)));
});

test('rejects inconsistent or empty registries', () => {
  assert.throws(() => sitemapCandidate(report([])));
  assert.throws(() => sitemapCandidate({ ...report(['https://www.openstack.org/']), candidateCount: 2 }));
});

test('existing crawler loc-line extraction yields seed URLs rather than XML tags', () => {
  const urls = ['https://www.openstack.org/', 'https://www.openstack.org/paper/?lang=fr_FR'];
  const locLines = sitemapCandidate(report(urls)).split('\n').filter(line => line.includes('loc')).join('\n') + '\n';
  // Exact sed expression from openstack-search conf/nutch/crawler.sh.
  const extracted = execFileSync('sed', ['s|<loc>\\(.*\\)</loc>$|\\1|g'], { input: locLines, encoding: 'utf8' });
  assert.deepEqual(extracted.trim().split('\n'), urls);
});
