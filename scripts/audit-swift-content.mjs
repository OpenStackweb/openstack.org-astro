// Inventory stored Swift dependencies, excluding the media registry's provenance.
// This is a source inventory, not a rendered-page or object-integrity certification.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { localMediaHref } from '../src/lib/server/media-assets.mjs';

const root = 'src/lib/content';
const registry = JSON.parse(await readFile(`${root}/media.json`, 'utf8'));
const rows = [];
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await scan(file);
    else if (entry.name.endsWith('.json') && file !== `${root}/media.json`) {
      const visit = (value, field = '') => {
        if (Array.isArray(value)) value.forEach((item, index) => visit(item, `${field}[${index}]`));
        else if (value && typeof value === 'object') {
          for (const [key, item] of Object.entries(value)) visit(item, field ? `${field}.${key}` : key);
        } else if (typeof value === 'string') {
          for (const match of value.matchAll(/https?:\/\/[^\s"<>]+/g)) {
            let url;
            try { url = new URL(match[0]); } catch { continue; }
            if (url.hostname !== 'object-storage-ca-ymq-1.vexxhost.net') continue;
            rows.push({ file, field, url: url.href,
              registryMapping: localMediaHref(url.href, registry),
              category: file.includes('/schedules/') ? 'archived-schedule-data'
                : url.pathname.includes('/summit-mobile-apps/') ? 'historical-app-download'
                  : 'editorial-asset',
            });
          }
        }
      };
      visit(JSON.parse(await readFile(file, 'utf8')));
    }
  }
}
await scan(root);
const checks = {};
if (process.argv.includes('--check-remote')) {
  for (const url of new Set(rows.map(row => row.url))) {
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      checks[url] = { status: response.status, finalURL: response.url,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length') };
    } catch (error) { checks[url] = { error: error.message }; }
  }
}
const report = {
  checkedAt: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  scope: 'Recursive content JSON strings, excluding media.json provenance. Mapping means registry coverage only; it does not prove the consuming renderer rewrites the URL, object existence, bytes, or appearance. Remote checks are HEAD requests only. Schedule fields and old application installers need separate consumer/ownership review before publication changes.',
  counts: rows.reduce((counts, row) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
    return counts;
  }, {}),
  references: rows,
  remoteChecks: checks,
};
await writeFile('docs/swift-content-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ counts: report.counts, uniqueURLs: new Set(rows.map(row => row.url)).size,
  mappedReferences: rows.filter(row => row.registryMapping).length,
  remoteStatuses: Object.values(checks).map(check => check.status ?? check.error) }, null, 2));
