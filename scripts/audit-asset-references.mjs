// Reference coverage only: registry presence is not proof of a deployed R2 object.
import { readFile, writeFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mediaKey } from '../src/lib/server/media-assets.mjs';
import { assetReferences, cssReferences } from './asset-reference-extraction.mjs';
const base = process.env.AUDIT_BASE;
assert.match(base || '', /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Use a local built preview');
const registry = JSON.parse(await readFile('src/lib/content/media.json', 'utf8'));
const editorial = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const conferences = JSON.parse(await readFile('src/lib/content/conference-keys.json', 'utf8'));
const sources = [...new Set(['/', '/marketing/', '/use-cases/', '/openstack-for-ai/', '/vmware-migration-to-openstack/', '/software/', '/community/', '/events/opendev-2020/', '/summit/other-summits/', ...conferences.map(key => `/summit/${key}/`), ...editorial])];
const references = new Map();
const sourceErrors = [];
const addReference = (candidate, source) => {
  const key = candidate.url;
  if (!references.has(key)) references.set(key, { url: key, sources: [], kind: candidate.kind, locations: [] });
  const row = references.get(key);
  if (!row.sources.includes(source)) row.sources.push(source);
  if (!row.locations.includes(candidate.location)) row.locations.push(candidate.location);
};
for (const source of sources) {
  try {
    const response = await fetch(base + source, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) throw new Error(`HTTP ${response.status} / ${response.headers.get('content-type')}`);
    const html = await response.text();
    if (!/<\/html>/i.test(html)) throw new Error('Incomplete HTML');
    for (const candidate of assetReferences(html, base + source)) addReference(candidate, source);
  } catch (error) { sourceErrors.push({ source, message: error.message }); }
}
const stylesheetChecks = [];
// Fetch each directly linked local stylesheet once; keep page provenance on its assets.
for (const sheet of [...references.values()].filter(row => row.locations.includes('link[rel=stylesheet]'))) {
  const url = new URL(sheet.url);
  const name = url.origin === base ? url.pathname + url.search : url.href;
  if (url.origin !== base) {
    stylesheetChecks.push({ url: name, status: 'external-not-fetched' });
    continue;
  }
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if (response.status !== 200 || !response.headers.get('content-type')?.toLowerCase().includes('text/css')) {
      throw new Error(`Stylesheet HTTP ${response.status} / ${response.headers.get('content-type')}`);
    }
    const candidates = cssReferences(await response.text(), url.href, `stylesheet ${name}`);
    for (const candidate of candidates) for (const source of sheet.sources) addReference(candidate, source);
    stylesheetChecks.push({ url: name, status: 'inspected', candidateCount: candidates.length, sourcePageCount: sheet.sources.length });
  } catch (error) {
    sourceErrors.push({ source: name, message: error.message });
    stylesheetChecks.push({ url: name, status: 'inspection-failed' });
  }
}
const rows = [];
for (const row of references.values()) {
  const url = new URL(row.url);
  if (url.origin !== base) row.coverage = 'external';
  else {
    let path;
    try { path = decodeURIComponent(url.pathname).replace(/^\//, ''); } catch { path = ''; }
    if (path && mediaKey(url.pathname) === path && Object.hasOwn(registry, path)) row.coverage = 'r2-registry';
    else if (path && !path.split('/').includes('..') && await stat('public/' + path).then(s => s.isFile(), () => false)) row.coverage = 'public-file';
    else if (path && !path.split('/').includes('..') && await stat('dist/client/' + path).then(s => s.isFile(), () => false)) row.coverage = 'build-file';
    else row.coverage = 'unresolved-local';
    row.url = url.pathname + url.search + url.hash;
  }
  rows.push(row);
}
const counts = rows.reduce((out, row) => (out[row.coverage] = (out[row.coverage] || 0) + 1, out), {});
await writeFile('docs/asset-reference-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), revision: execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(), scope: 'Rendered img src, img/source srcset, inline style attribute/style element and directly linked local stylesheet url() values, and file-extension anchor href references in editorial pages, seven main landing pages, six conference landings and the OpenDev 2020 and Other Summits archives. R2 coverage requires a path accepted by the actual media handler. Excludes external stylesheet contents, nested CSS imports, CSS image-set string candidates, lazy data attributes, dynamically fetched app content and non-extension download endpoints. CSS URLs are candidates, not computed-style visibility evidence. Registry/file presence only; no R2 existence, external availability, byte integrity or visual certification.', sourceCount: sources.length, sourceErrors, stylesheetChecks, counts, references: rows }, null, 2) + '\n');
console.log({ sourceCount: sources.length, sourceErrors, stylesheetCount: stylesheetChecks.length, counts });
if (sourceErrors.length) process.exitCode = 1;
