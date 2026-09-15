import { historicalReleasePaths } from '../src/lib/server/historical-releases.mjs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { releasePath } from '../src/lib/server/release-announcements.mjs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4407';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Use a local built preview');
const paths = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
const conferences = JSON.parse(await readFile('src/lib/content/conference-keys.json', 'utf8'));
const releaseAnnouncements = await Promise.all(
  (await readdir('src/lib/content/releases')).filter(name => name.endsWith('.json')).map(async name =>
    releasePath(JSON.parse(await readFile(`src/lib/content/releases/${name}`, 'utf8')).slug)),
);
const sources = [
  ...new Set([
    '/',
    '/use-cases/',
    '/marketing/',
    '/openstack-for-ai/',
    '/vmware-migration-to-openstack/',
    '/software/',
    '/community/',
    '/community/supporting-organizations/',
    '/learn/',
    '/coa/',
    '/events/opendev-2020/', '/summit/other-summits/', ...historicalReleasePaths,
    ...releaseAnnouncements,
    ...conferences.map(key => `/summit/${key}/`),
    ...paths,
  ]),
];
const cache = new Map();
const links = new Map();
const skipped = { external: 0, assets: 0, queries: 0, applicationActions: 0 };
const sourceErrors = [];
const appAction =
  /\/(?:auth|admin|api|cms-media|Security|OpenStackIdAuthenticator)(?:\/|$)|\/(?:logout|signout)(?:\/|$)/i;
const asset = /\/(?:assets|images|_astro)\/|\.(?:pdf|zip|png|jpe?g|gif|svg|webp|mp4|gz|tgz)$/i;

function get(path) {
  if (!cache.has(path))
    cache.set(
      path,
      (async () => {
        const response = await fetch(base + path, {
          redirect: 'manual',
          signal: AbortSignal.timeout(15000),
        });
        const location = response.headers.get('location');
        if (location) return { status: response.status, location };
        if (!response.headers.get('content-type')?.includes('text/html'))
          return { status: response.status, nonHtml: true };
        const html = await response.text();
        if (html.length > 2_000_000) throw new Error('HTML exceeds audit limit');
        const document = parseDocument(html);
        const elements = DomUtils.findAll(() => true, document.children);
        return {
          status: response.status,
          notice: /class="application-notice|This page is a migration notice/.test(html),
          ids: new Set(
            elements.flatMap((node) =>
              [node.attribs?.id, node.name === 'a' ? node.attribs?.name : null].filter(Boolean),
            ),
          ),
          hrefs: elements
            .filter((node) => node.name === 'a')
            .map((node) => node.attribs.href)
            .filter(Boolean),
        };
      })(),
    );
  return cache.get(path);
}

async function each(items, task) {
  let index = 0;
  await Promise.all(
    Array.from({ length: 5 }, async () => {
      while (index < items.length) await task(items[index++]);
    }),
  );
}

await each(sources, async (path) => {
  try {
    const page = await get(path);
    if (page.status !== 200 || !page.hrefs) {
      sourceErrors.push({ path, status: page.status });
      return;
    }
    for (const href of page.hrefs) {
      let url;
      try {
        url = new URL(href, base + path);
      } catch {
        continue;
      }
      if (url.origin !== base) {
        skipped.external++;
        continue;
      }
      if (appAction.test(url.pathname)) {
        skipped.applicationActions++;
        continue;
      }
      if (asset.test(url.pathname)) {
        skipped.assets++;
        continue;
      }
      if ([...url.searchParams.keys()].some((key) => key !== '_ga' && !key.startsWith('utm_'))) {
        skipped.queries++;
        continue;
      }
      const key = url.pathname + url.hash;
      if (!links.has(key))
        links.set(key, { path: url.pathname, hash: url.hash, sources: new Set() });
      links.get(key).sources.add(path);
    }
  } catch (error) {
    sourceErrors.push({ path, error: error.message });
  }
});

const findings = [];
await each([...links.values()], async (link) => {
  let path = link.path;
  let hash = link.hash;
  const seen = new Set();
  let result;
  try {
    for (let hop = 0; hop < 10; hop++) {
      if (seen.has(path)) {
        result = 'redirect-loop';
        break;
      }
      seen.add(path);
      const response = await get(path);
      if (response.location) {
        const target = new URL(response.location, base + path);
        if (target.origin !== base) {
          result = 'external-redirect-unverified';
          break;
        }
        if (target.search) {
          result = 'query-redirect-unverified';
          break;
        }
        if (asset.test(target.pathname) || appAction.test(target.pathname)) {
          result = 'asset-or-app-redirect-unverified';
          break;
        }
        path = target.pathname;
        hash = target.hash || hash;
        continue;
      }
      if (response.status !== 200) result = `http-${response.status}`;
      else if (response.notice) result = 'migration-notice';
      else if (hash && !response.nonHtml && !response.ids.has(decodeURIComponent(hash.slice(1))))
        result = 'fragment-not-in-server-html';
      else result = 'ok';
      break;
    }
    result ||= 'redirect-limit';
  } catch (error) {
    result = 'request-error';
  }
  if (result !== 'ok')
    findings.push({
      target: link.path + link.hash,
      resolvedPath: path,
      result,
      sources: [...link.sources].sort(),
    });
});
findings.sort((a, b) => a.target.localeCompare(b.target));
const counts = findings.reduce(
  (out, row) => ({ ...out, [row.result]: (out[row.result] || 0) + 1 }),
  {},
);
await writeFile(
  'docs/internal-link-audit.json',
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      worktreeChanges: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean),
      revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      scope:
        'Local built HTML from the editorial cohort, ten landing pages, conference/archive routes and all Git-managed release announcements, including shared navigation/footer. Same-origin links only. No external browsing, application actions, assets or query-dependent targets are certified. Missing fragments require browser verification after hydration; matching fragments proves existence, not usability. Built revision must be verified separately.',
      sourceCount: sources.length,
      targetCount: links.size,
      skipped,
      counts,
      sourceErrors,
      findings,
    },
    null,
    2,
  ) + '\n',
);
console.log({ sources: sources.length, targets: links.size, counts, sourceErrors });
