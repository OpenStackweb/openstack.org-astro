import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const base = process.env.AUDIT_BASE ?? 'http://127.0.0.1:4395';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/, 'Use a local built preview');
const inventory = JSON.parse(await readFile('src/lib/content/review-route-inventory.json', 'utf8'));
const entries = Object.entries(inventory);
const rows = [];
let next = 0;
async function worker() {
  while (next < entries.length) {
    const [path, sourceClass] = entries[next++];
    try {
      const response = await fetch(base + path, {
        redirect: 'manual',
        signal: AbortSignal.timeout(20000),
      });
      const html = await response.text();
      const notice =
        /This template or application has not been ported|This page is a migration notice|class="application-notice/.test(
          html,
        );
      const rendering =
        response.status >= 300 && response.status < 400
          ? 'redirect'
          : response.status !== 200
            ? 'error'
            : notice
              ? 'notice'
              : 'rendered-unverified';
      rows.push({
        path,
        sourceClass,
        status: response.status,
        rendering,
        ...(rendering === 'redirect' ? { destination: response.headers.get('location') } : {}),
      });
    } catch (error) {
      rows.push({ path, sourceClass, rendering: 'error', error: error.message });
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
rows.sort((a, b) => a.path.localeCompare(b.path));
const counts = rows.reduce((counts, row) => {
  counts[row.rendering] = (counts[row.rendering] ?? 0) + 1;
  return counts;
}, {});
await writeFile(
  'docs/inventory-route-audit.json',
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      workingTreeChanges: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean),
      scope:
        'Known public route inventory only. HTTP rendering does not prove visual, editorial, CMS or application parity. Redirect destinations are not followed. Built preview revision must be verified separately.',
      counts,
      rows,
    },
    null,
    2,
  ) + '\n',
);
console.log(counts);
if (counts.error) process.exitCode = 1;
