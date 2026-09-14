import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { DomUtils } from 'htmlparser2';
import { readAuditHtml } from './lib/audit-html-response.mjs';
import { releasePath } from '../src/lib/server/release-announcements.mjs';
import { flatten } from '../src/lib/software/catalog.mjs';

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4410';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const editorial = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const papers = JSON.parse(await readFile('src/lib/content/paper-routes.json', 'utf8'));
const profiles = JSON.parse(await readFile('src/lib/companies/profiles.json', 'utf8'));
const currentCatalog = JSON.parse(await readFile('src/lib/software/catalog.json', 'utf8'));
const currentRelease = JSON.parse(await readFile('src/lib/software/catalog-release.json', 'utf8'));
const releaseHistory = JSON.parse(await readFile('src/lib/software/release-history.json', 'utf8'));
// Match the runtime's current-release override; enumerate actual snapshot links,
// including release query variants rather than assuming identical memberships.
const catalogs = new Map(releaseHistory.map((item) => [item.release.slug, item]));
catalogs.set(currentRelease.slug, { release: currentRelease, catalog: currentCatalog });
const softwarePaths = [...catalogs.values()].flatMap(({ release, catalog }) => [
  ...catalog.map((row) =>
    `/software/project-navigator/${row.category.slug}/?release=${encodeURIComponent(release.slug)}`,
  ),
  ...flatten(catalog).map((component) => `/software${component.href}`),
]);
const releases = await Promise.all(
  (await readdir('src/lib/content/releases')).filter(name => name.endsWith('.json')).map(async name => {
    const content = JSON.parse(await readFile(`src/lib/content/releases/${name}`, 'utf8'));
    return releasePath(content.slug);
  }),
);
const paths = [
  ...new Set([
    ...editorial,
    ...releases,
    ...softwarePaths,
    ...profiles.map((profile) => `/community/supporting-organizations/profile/${profile.slug}/`),
    '/',
    '/use-cases/',
    '/marketing/',
    '/openstack-for-ai/',
    '/vmware-migration-to-openstack/',
    '/community/',
    '/software/',
    '/software/start/',
    '/software/project-navigator/openstack-components/',
    ...Object.entries(papers).flatMap(([path, locales]) =>
      locales.map((locale) => `${path}?lang=${locale}`),
    ),
    '/videos/',
    '/marketplace/',
    '/brand/web-badges/',
  ]),
];
const rows = [];
let inspectionFailures = 0;
let index = 0;
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (index < paths.length) {
      const path = paths[index++];
      const issues = [];
      try {
        const response = await fetch(base + path, {
          redirect: 'manual',
          signal: AbortSignal.timeout(15000),
        });
        const inspected = await readAuditHtml(response);
        if (inspected.failure) {
          inspectionFailures++;
          rows.push({ path, status: response.status, issues: [inspected.failure] });
          continue;
        }
        const { elements } = inspected;
        const named = (name) => elements.filter((el) => el.name === name);
        const meta = (name) =>
          named('meta')
            .filter((el) => el.attribs.name === name || el.attribs.property === name)
            .map((el) => el.attribs.content || '');
        const canonical = named('link')
          .filter((el) => el.attribs.rel === 'canonical')
          .map((el) => el.attribs.href || '');
        const titles = named('title').map((el) => DomUtils.textContent(el).trim());
        const headings = named('h1').map((el) => DomUtils.textContent(el).trim());
        const description = meta('description');
        for (const [key, values] of Object.entries({
          title: titles,
          h1: headings,
          description,
          canonical,
          'og:title': meta('og:title'),
          'og:description': meta('og:description'),
          'og:url': meta('og:url'),
          'og:image': meta('og:image'),
          'og:image:alt': meta('og:image:alt'),
          'og:locale': meta('og:locale'),
          'twitter:card': meta('twitter:card'),
          'twitter:title': meta('twitter:title'),
          'twitter:description': meta('twitter:description'),
          'twitter:image': meta('twitter:image'),
          'twitter:image:alt': meta('twitter:image:alt'),
        })) {
          if (values.length !== 1) issues.push(`${key}-count-${values.length}`);
          else if (!values[0].trim()) issues.push(`${key}-empty`);
        }
        if (titles[0] !== meta('og:title')[0]) issues.push('og-title-mismatch');
        if (description[0] !== meta('og:description')[0]) issues.push('og-description-mismatch');
        if (canonical[0] !== meta('og:url')[0]) issues.push('og-canonical-mismatch');
        try {
          const schemas = named('script').filter(el => el.attribs.type === 'application/ld+json')
            .map(el => JSON.parse(DomUtils.textContent(el)));
          const pageSchema = schemas.find(item => item['@type'] === 'WebPage');
          if (!pageSchema || pageSchema.url !== canonical[0] || pageSchema.name !== titles[0])
            issues.push('webpage-schema-mismatch');
        } catch { issues.push('structured-data-invalid-json'); }
        for (const field of ['title', 'description', 'image', 'image:alt']) {
          if (meta(`twitter:${field}`)[0] !== meta(`og:${field}`)[0])
            issues.push(`twitter-${field}-mismatch`);
        }
        const release = new URL(path, base).searchParams.get('release');
        if (release && path.startsWith('/software/project-navigator/') &&
            new URL(canonical[0]).searchParams.get('release') !== release)
          issues.push('release-canonical-mismatch');
        try {
          if (new URL(canonical[0]).origin !== 'https://www.openstack.org')
            issues.push('canonical-origin');
        } catch {
          issues.push('canonical-invalid');
        }
        try {
          if (!['http:', 'https:'].includes(new URL(meta('og:image')[0]).protocol))
            issues.push('og-image-protocol');
        } catch {
          issues.push('og-image-invalid');
        }
        const lang = named('html')[0]?.attribs.lang;
        const alternates = named('link').filter(el => el.attribs.rel === 'alternate' && el.attribs.hreflang);
        if (alternates.length) {
          if (!alternates.some(el => el.attribs.hreflang === lang && el.attribs.href === canonical[0]))
            issues.push('hreflang-self-canonical-mismatch');
          if (alternates.filter(el => el.attribs.hreflang === 'x-default').length !== 1)
            issues.push('hreflang-default-missing');
        }
        if (!lang || lang !== meta('og:locale')[0]?.replaceAll('_', '-'))
          issues.push('language-locale-mismatch');
        if (!meta('robots').some((value) => /\bnoindex\b/i.test(value)))
          issues.push('preview-meta-noindex-missing');
        if (!/\bnoindex\b/i.test(response.headers.get('x-robots-tag') || ''))
          issues.push('preview-header-noindex-missing');
        rows.push({
          path,
          status: response.status,
          title: titles[0],
          descriptionLength: description[0]?.length || 0,
          socialImage: meta('og:image')[0],
          socialImageAlt: meta('og:image:alt')[0] || '',
          canonical: canonical[0],
          lang,
          issues,
        });
      } catch {
        inspectionFailures++;
        rows.push({ path, issues: ['request-failed'] });
      }
    }
  }),
);
rows.sort((a, b) => a.path.localeCompare(b.path));
const counts = {};
for (const row of rows) for (const issue of row.issues) counts[issue] = (counts[issue] || 0) + 1;
const duplicates = (field) =>
  Object.entries(
    Object.groupBy(
      rows.filter((row) => row[field]),
      (row) => row[field],
    ),
  )
    .filter(([, items]) => items.length > 1)
    .map(([value, items]) => ({ value, paths: items.map((row) => row.path) }));
await writeFile(
  'docs/seo-rendered-audit.json',
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      worktreeChanges: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean),
      scope:
        'Local built HTML metadata only. Preview must remain noindex; this does not certify production indexing readiness. Editorial pages, release announcements, selected landing/app routes, translated papers, all bundled company profiles and Software snapshot component/category routes across releases. No image retrieval, social-crawler accessibility, editorial quality, external canonical target, structured-data or full-site coverage certification. Duplicate values are review candidates, not automatic defects. Build identity must be verified separately.',
      sourceCount: paths.length,
      inspectionFailures,
      counts,
      duplicateTitles: duplicates('title'),
      duplicateCanonicals: duplicates('canonical'),
      rows,
    },
    null,
    2,
  ) + '\n',
);
console.log({ sourceCount: paths.length, inspectionFailures, counts });
// Missing metadata is reported for editorial review; failed requests mean the
// audit could not inspect its targets and must not look successful to automation.
if (inspectionFailures) process.exitCode = 1;
