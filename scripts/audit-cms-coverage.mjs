import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const allowlist = JSON.parse(await readFile('tina/editorial-pages.json', 'utf8'));
const editable = new Map(allowlist.map((page) => [page.filename, page.path]));
const lock = JSON.parse(await readFile('tina/tina-lock.json', 'utf8'));
const collection = lock.schema.collections.find((row) => row.name === 'editorial');
const fields = new Set(collection.fields.map((field) => field.name));
const rows = [];
for (const file of (await readdir('src/lib/content/pages'))
  .filter((file) => file.endsWith('.json'))
  .sort()) {
  const page = JSON.parse(await readFile('src/lib/content/pages/' + file, 'utf8'));
  const filename = file.slice(0, -5);
  const unrepresentedFields = Object.keys(page)
    .filter((key) => !fields.has(key))
    .sort();
  rows.push({
    filename,
    path: page.path,
    inEditor: editable.has(filename),
    routeMatches: !editable.has(filename) || editable.get(filename) === page.path,
    unrepresentedFields,
  });
}
const excludedGroups = Object.entries(
  Object.groupBy(
    rows.filter((row) => !row.inEditor),
    (row) => row.unrepresentedFields.join(','),
  ),
).map(([fields, pages]) => ({
  fields: fields.split(',').filter(Boolean),
  count: pages.length,
  paths: pages.map((page) => page.path),
}));
const report = {
  checkedAt: new Date().toISOString(),
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  scope:
    'Git source and generated Tina schema coverage of src/lib/content/pages only. This does not certify save round-trips, nested field coverage, editor interaction, application administration or all top-level page collections. Unsupported fields must not be stripped to increase coverage.',
  count: rows.length,
  inEditor: rows.filter((row) => row.inEditor).length,
  excluded: rows.filter((row) => !row.inEditor).length,
  invalidIncluded: rows.filter(
    (row) => row.inEditor && (!row.routeMatches || row.unrepresentedFields.length),
  ),
  excludedGroups,
  rows,
};
await writeFile('docs/cms-coverage-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log({
  count: report.count,
  inEditor: report.inEditor,
  excluded: report.excluded,
  invalidIncluded: report.invalidIncluded.length,
  excludedGroups: excludedGroups.map(({ fields, count }) => ({ fields, count })),
});
if (report.invalidIncluded.length) process.exitCode = 1;
