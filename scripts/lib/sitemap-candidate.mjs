import assert from 'node:assert/strict';

const escapeXml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character],
  );

/** Serialize reviewed candidates only; held routes never enter this artifact. */
export function sitemapCandidate(report) {
  assert.ok(Array.isArray(report.candidates), 'Missing candidate registry');
  assert.equal(report.candidateCount, report.candidates.length, 'Candidate count mismatch');
  assert.ok(report.candidates.length > 0, 'Empty candidate registry');
  assert.ok(report.candidates.length <= 50000, 'Split large registries before serialization');
  const seen = new Set();
  const entries = report.candidates.map(({ url }) => {
    assert.equal(typeof url, 'string', 'Candidate URL must be text');
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://www.openstack.org', 'Unexpected canonical origin');
    assert.ok(!parsed.username && !parsed.password && !parsed.hash, 'Invalid canonical URL');
    assert.equal(parsed.href, url, 'Canonical URL must already be normalized');
    assert.ok(!seen.has(url), `Duplicate canonical: ${url}`);
    seen.add(url);
    return `  <url><loc>${escapeXml(url)}</loc></url>`;
  });
  // The source registry has no trustworthy publication dates: omit lastmod.
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- OFFLINE REVIEW CANDIDATE: not a launch-approved or served sitemap. -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') +
    '\n</urlset>\n'
  );
}
