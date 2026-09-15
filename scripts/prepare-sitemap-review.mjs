import { historicalReleasePaths } from '../src/lib/server/historical-releases.mjs';
// Offline launch planning only. This does not expose a sitemap or enable indexing.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { canonicalFor } from '../src/lib/seo.mjs';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const audit = await json('docs/seo-rendered-audit.json');
const editorial = new Set(await json('src/lib/content/editorial-paths.json'));
const papers = await json('src/lib/content/paper-routes.json');
const conferences = await json('src/lib/content/conference-keys.json');
const releases = new Set();
for (const name of await readdir('src/lib/content/releases')) {
  if (!name.endsWith('.json')) continue;
  const { slug } = await json(`src/lib/content/releases/${name}`);
  releases.add(`/software/openstack-${slug}/`);
}
const landings = new Set(['/', '/use-cases/', '/events/opendev-2020/', '/summit/other-summits/', ...historicalReleasePaths, '/marketing/', '/openstack-for-ai/',
  '/vmware-migration-to-openstack/', '/community/', '/learn/', '/coa/',
  '/community/supporting-organizations/', ...conferences.map(key => `/summit/${key}/`)]);
const candidates = new Map();
const held = [];
for (const row of audit.rows) {
  const url = new URL(row.path, 'https://www.openstack.org');
  const path = url.pathname;
  let reason;
  if (row.status !== 200 || row.issues.length) reason = 'Rendered metadata requires review';
  else if (/\/(thanks|sample-profile)\/$/.test(path)) reason = 'Confirmation or example page';
  else if (path === '/summit/vancouver-placeholder/') reason = 'Historical save-the-date placeholder; event archive has its own route';
  else if (papers[path]) {
    if (!papers[path].includes(url.searchParams.get('lang') || 'en_US')) reason = 'Unknown paper locale';
  } else if (!editorial.has(path) && !releases.has(path) && !landings.has(path)) {
    reason = 'Application, service snapshot, notice, or route outside reviewed content scope';
  }
  if (reason) { held.push({ path: row.path, reason }); continue; }
  const canonical = canonicalFor(path, { locale: url.searchParams.get('lang') });
  assert.equal(row.canonical, canonical, `Canonical changed: ${row.path}`);
  const sources = candidates.get(canonical) || [];
  sources.push(row.path);
  candidates.set(canonical, sources);
}
const report = {
  scope: 'Offline candidates from the recorded rendered audit, not an active sitemap or launch approval. Imported editorial content needs final route/content review. Service snapshots and notices are held separately. Routes absent from the source audit are not assessed.',
  sourceAudit: { checkedAt: audit.checkedAt, revision: audit.revision, worktreeChanges: audit.worktreeChanges },
  auditedPaths: audit.rows.length,
  candidateCount: candidates.size,
  heldCount: held.length,
  candidates: [...candidates].sort(([a], [b]) => a.localeCompare(b)).map(([url, sourcePaths]) => ({ url, sourcePaths })),
  held,
};
assert.equal([...candidates.values()].flat().length + held.length, audit.rows.length);
await writeFile('docs/sitemap-review.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ auditedPaths: report.auditedPaths, candidates: candidates.size, held: held.length }));
