// Reference coverage only: registry presence is not proof of a deployed R2 object.
import { readFile, writeFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { assetReferences } from './asset-reference-extraction.mjs';
const base = process.env.AUDIT_BASE;
assert.match(base || '', /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Use a local built preview');
const registry = JSON.parse(await readFile('src/lib/content/media.json', 'utf8'));
const editorial = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const sources = [...new Set(['/', '/use-cases/', '/openstack-for-ai/', '/vmware-migration-to-openstack/', '/software/', '/community/', ...editorial])];
const references = new Map();
const sourceErrors = [];
for (const source of sources) {
  try {
    const response = await fetch(base + source, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) throw new Error(`HTTP ${response.status} / ${response.headers.get('content-type')}`);
    const html = await response.text();
    if (!/<\/html>/i.test(html)) throw new Error('Incomplete HTML');
    for (const candidate of assetReferences(html, base + source)) {
      const key = candidate.url;
      if (!references.has(key)) references.set(key, { url: key, sources: [], kind: candidate.kind, locations: [] });
      const row = references.get(key);
      if (!row.sources.includes(source)) row.sources.push(source);
      if (!row.locations.includes(candidate.location)) row.locations.push(candidate.location);
    }
  } catch (error) { sourceErrors.push({ source, message: error.message }); }
}
const rows = [];
for (const row of references.values()) {
  const url = new URL(row.url);
  if (url.origin !== base) row.coverage = 'external';
  else {
    let path;
    try { path = decodeURIComponent(url.pathname).replace(/^\//, ''); } catch { path = ''; }
    if (path && Object.hasOwn(registry, path)) row.coverage = 'r2-registry';
    else if (path && !path.split('/').includes('..') && await stat('public/' + path).then(s => s.isFile(), () => false)) row.coverage = 'public-file';
    else if (path && !path.split('/').includes('..') && await stat('dist/client/' + path).then(s => s.isFile(), () => false)) row.coverage = 'build-file';
    else row.coverage = 'unresolved-local';
    row.url = url.pathname + url.search + url.hash;
  }
  rows.push(row);
}
const counts = rows.reduce((out, row) => (out[row.coverage] = (out[row.coverage] || 0) + 1, out), {});
await writeFile('docs/asset-reference-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), revision: execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), scope: 'Rendered img src, img/source srcset, inline style attribute/style element url() values, and file-extension anchor href references in editorial pages and six landing pages. Excludes linked stylesheets, CSS image-set string candidates/imports, lazy data attributes, dynamically fetched app content and non-extension download endpoints. CSS URLs are candidates, not computed-style visibility evidence. Registry/file presence only; no R2 existence, external availability, byte integrity or visual certification.', sourceCount: sources.length, sourceErrors, counts, references: rows }, null, 2) + '\n');
console.log({ sourceCount: sources.length, sourceErrors, counts });
if (sourceErrors.length) process.exitCode = 1;
