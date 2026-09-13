import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { parseDocument, DomUtils } from 'htmlparser2';

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4410';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const editorial = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const papers = JSON.parse(await readFile('src/lib/content/paper-routes.json', 'utf8'));
const paths = [
  ...new Set([
    ...editorial,
    '/',
    '/use-cases/',
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
        if (response.status !== 200) {
          rows.push({ path, status: response.status, issues: ['not-rendered-200'] });
          continue;
        }
        const document = parseDocument(await response.text());
        const elements = DomUtils.findAll(() => true, document.children);
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
          'og:locale': meta('og:locale'),
          'twitter:card': meta('twitter:card'),
        })) {
          if (values.length !== 1) issues.push(`${key}-count-${values.length}`);
          else if (!values[0].trim()) issues.push(`${key}-empty`);
        }
        if (titles[0] !== meta('og:title')[0]) issues.push('og-title-mismatch');
        if (description[0] !== meta('og:description')[0]) issues.push('og-description-mismatch');
        if (canonical[0] !== meta('og:url')[0]) issues.push('og-canonical-mismatch');
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
          canonical: canonical[0],
          lang,
          issues,
        });
      } catch {
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
        'Local built HTML metadata only. Preview must remain noindex; this does not certify production indexing readiness. Editorial pages, selected landing/app routes and translated papers. No image retrieval, social-crawler accessibility, editorial quality, external canonical target, structured-data or full-site coverage certification. Duplicate values are review candidates, not automatic defects. Build identity must be verified separately.',
      sourceCount: paths.length,
      counts,
      duplicateTitles: duplicates('title'),
      duplicateCanonicals: duplicates('canonical'),
      rows,
    },
    null,
    2,
  ) + '\n',
);
console.log({ sourceCount: paths.length, counts });
// Missing metadata is reported for editorial review; failed requests mean the
// audit could not inspect its targets and must not look successful to automation.
if (counts['request-failed']) process.exitCode = 1;
