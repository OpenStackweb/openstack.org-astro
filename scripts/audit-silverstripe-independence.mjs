// Explicit local audit. Never follows a redirect to the retired website.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { parseDocument, DomUtils } from 'htmlparser2';
import { flatten } from '../src/lib/software/catalog.mjs';
import { releasePath } from '../src/lib/server/release-announcements.mjs';
import { softwareSamplePaths } from './lib/software-sample-paths.mjs';
import { historicalReleasePaths } from '../src/lib/server/historical-releases.mjs';
import { assetReferences, cssReferences } from './asset-reference-extraction.mjs';
import { isRetiredWebsiteHost } from '../src/lib/network/upstream.mjs';
const base = process.env.AUDIT_BASE;
assert.match(base || '', /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Use a local built Worker');
const editorial = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const conferences = JSON.parse(await readFile('src/lib/content/conference-keys.json', 'utf8'));
const papers = JSON.parse(await readFile('src/lib/content/paper-routes.json', 'utf8'));
const profiles = JSON.parse(await readFile('src/lib/companies/profiles.json', 'utf8'));
const currentCatalog = JSON.parse(await readFile('src/lib/software/catalog.json', 'utf8'));
const currentRelease = JSON.parse(await readFile('src/lib/software/catalog-release.json', 'utf8'));
const marketplace = JSON.parse(await readFile('src/lib/marketplace/catalog.json', 'utf8'));
const marketplacePaths = marketplace.categories.flatMap((category) => [
  `/marketplace/${category.slug}/`,
  ...category.records
    .map((record) => record.href)
    .filter((href) => href.startsWith('/marketplace/')),
]);
const releaseHistory = JSON.parse(await readFile('src/lib/software/release-history.json', 'utf8'));
// Match the runtime's current-release override; enumerate actual snapshot links,
// including release query variants rather than assuming identical memberships.
const catalogs = new Map(releaseHistory.map((item) => [item.release.slug, item]));
catalogs.set(currentRelease.slug, { release: currentRelease, catalog: currentCatalog });
const softwarePaths = [...catalogs.values()].flatMap(({ release, catalog }) => [
  ...catalog.map(
    (row) =>
      `/software/project-navigator/${row.category.slug}/?release=${encodeURIComponent(release.slug)}`,
  ),
  ...flatten(catalog).map((component) => `/software${component.href}`),
]);
const releases = await Promise.all(
  (await readdir('src/lib/content/releases'))
    .filter((name) => name.endsWith('.json'))
    .map(async (name) => {
      const content = JSON.parse(await readFile(`src/lib/content/releases/${name}`, 'utf8'));
      return releasePath(content.slug);
    }),
);
const metadataPaths = [
  ...new Set([
    ...editorial,
    ...releases,
    ...softwarePaths,
    ...marketplacePaths,
    ...softwareSamplePaths,
    ...profiles.map((profile) => `/community/supporting-organizations/profile/${profile.slug}/`),
    '/',
    '/use-cases/',
    '/events/opendev-2020/',
    '/summit/other-summits/',
    ...historicalReleasePaths,
    '/marketing/',
    '/openstack-for-ai/',
    '/vmware-migration-to-openstack/',
    '/community/',
    '/community/supporting-organizations/',
    '/learn/',
    '/coa/',
    '/software/',
    '/software/start/',
    '/software/project-navigator/openstack-components/',
    ...Object.entries(papers).flatMap(([path, locales]) =>
      locales.map((locale) => `${path}?lang=${locale}`),
    ),
    ...conferences.map((key) => `/summit/${key}/`),
    '/videos/',
    '/marketplace/',
    '/brand/web-badges/',
  ]),
];

const inventory = JSON.parse(await readFile('src/lib/content/review-route-inventory.json', 'utf8'));
const paths = [
  ...new Set([
    ...metadataPaths,
    ...Object.keys(inventory),
    '/user-survey/',
    '/user-survey/staff/',
    '/profile/',
    '/join/register/',
    '/events/post-an-event/',
    '/brand/logo-request/',
    '/community/jobs/post-a-job/',
  ]),
];
const findings = [],
  errors = [],
  resources = new Map(),
  stylesheets = new Map();
let index = 0,
  notices = 0,
  redirects = 0,
  htmlPages = 0;
const independentBlog = (url) =>
  url.hostname === 'www.openstack.org' && /^\/blog(?:\/|$)/.test(url.pathname);
function inspectURL(raw, source, kind) {
  if (!raw || raw.startsWith('#') || raw.startsWith('data:')) return;
  let url;
  try {
    url = new URL(raw, base + source);
  } catch {
    return;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return;
  if (isRetiredWebsiteHost(url.hostname) && !independentBlog(url))
    findings.push({ source, kind, host: url.hostname, path: url.pathname });
  return url;
}
function asset(raw, source, kind) {
  const url = inspectURL(raw, source, kind);
  if (!url) return;
  const key = url.origin === base ? url.pathname : url.origin + url.pathname;
  resources.set(key, { url: key, kind });
}
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (index < paths.length) {
      const path = paths[index++];
      try {
        const response = await fetch(base + path, {
          redirect: 'manual',
          signal: AbortSignal.timeout(30000),
        });
        if (response.status >= 300 && response.status < 400) {
          redirects++;
          inspectURL(response.headers.get('location'), path, 'redirect');
          continue;
        }
        if (response.status !== 200) {
          errors.push({ source: path, status: response.status });
          continue;
        }
        if (!response.headers.get('content-type')?.includes('text/html')) continue;
        const html = await response.text();
        htmlPages++;
        if (/class="application-notice|This page is a migration notice/.test(html)) notices++;
        for (const candidate of assetReferences(html, base + path))
          asset(candidate.url, path, candidate.location);
        for (const node of DomUtils.findAll(() => true, parseDocument(html).children)) {
          const a = node.attribs || {};
          if (node.name === 'a') inspectURL(a.href, path, 'navigation');
          if (node.name === 'form') inspectURL(a.action || path, path, 'form');
          for (const key of ['src', 'poster', 'data-src'])
            if (
              a[key] &&
              ['script', 'iframe', 'video', 'audio', 'source', 'img', 'input'].includes(node.name)
            )
              asset(a[key], path, node.name + '[' + key + ']');
          if (node.name === 'object') asset(a.data, path, 'object[data]');
          if (node.name === 'link' && /stylesheet|preload|icon/.test(a.rel || '')) {
            const url = inspectURL(a.href, path, 'link[' + a.rel + ']');
            if (url?.origin === base && (a.rel || '').split(/\s+/).includes('stylesheet'))
              stylesheets.set(url.href, path);
          }
        }
      } catch (error) {
        errors.push({ source: path, error: error.name });
      }
    }
  }),
);
for (const [href, source] of stylesheets) {
  try {
    const response = await fetch(href, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200);
    for (const candidate of cssReferences(await response.text(), href))
      asset(candidate.url, source, 'stylesheet url()');
  } catch (error) {
    errors.push({ source: new URL(href).pathname, error: error.name });
  }
}
const counts = {};
for (const row of findings) counts[row.kind] = (counts[row.kind] || 0) + 1;
const report = {
  checkedAt: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  scope:
    'Known published metadata and deferred inventory routes, rendered resource/navigation/form/redirect destinations and local stylesheet URLs; legacy upstreams blocked by application fetch policy. Blog, Summit, Search, IDP and other independent applications are retained. Does not certify completion of deferred features or production cutover.',
  paths: paths.length,
  htmlPages,
  redirects,
  notices,
  stylesheetCount: stylesheets.size,
  resourceCount: resources.size,
  legacyFindingCounts: counts,
  findings,
  errors,
};
const output = process.env.AUDIT_OUTPUT || 'docs/silverstripe-independence-audit.json';
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify({
    paths: paths.length,
    htmlPages,
    redirects,
    notices,
    resources: resources.size,
    findings: findings.length,
    errors: errors.length,
    legacyFindingCounts: counts,
  }),
);
if (findings.length || errors.length) process.exitCode = 1;
