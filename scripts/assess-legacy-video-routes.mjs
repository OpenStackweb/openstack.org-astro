// Read-only local snapshot assessment. Does not call the mutating legacy detail
// endpoint, contact YouTube, publish routes, or import API-owned records into CMS.
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const [readerConfig, outputPath] = process.argv.slice(2);
assert.ok(readerConfig && outputPath, 'Supply a local MySQL reader config and private output path');
// Keep source spelling, including periods and trailing hyphens. Never slugify
// an existing URL: that would silently lose bookmarks. Exclude path delimiters
// and dot-segments; assert URL parsing preserves the complete path below.
const safeSegment = (value) =>
  typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._~-]*$/.test(value);
const sql = `SELECT JSON_OBJECT('id',v.ID,'youtube_id',v.YouTubeID,'summit',s.Slug,'presentation',p.Slug)
 FROM PresentationVideo v JOIN PresentationMaterial m ON m.ID=v.ID
 LEFT JOIN Presentation p ON p.ID=m.PresentationID
 LEFT JOIN SummitEvent e ON e.ID=p.ID LEFT JOIN Summit s ON s.ID=e.SummitID
 WHERE m.DisplayOnSite=1 AND v.Processed=1 ORDER BY v.ID`;
const rows = execFileSync(
  'mysql',
  [
    `--defaults-extra-file=${readerConfig}`,
    '--batch',
    '--raw',
    '--skip-column-names',
    'openstack_full',
    '-e',
    sql,
  ],
  { encoding: 'utf8', maxBuffer: 10_000_000 },
)
  .trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const groups = new Map();
const unsupported = [];
for (const row of rows) {
  if (
    !/^[A-Za-z0-9_-]{11}$/.test(row.youtube_id ?? '') ||
    !safeSegment(row.summit) ||
    !safeSegment(row.presentation)
  ) {
    unsupported.push(row);
    continue;
  }
  const path = `/videos/summits/${row.summit}/${row.presentation}`;
  assert.equal(new URL(path, 'https://archive.invalid').pathname, path);
  if (!groups.has(path)) groups.set(path, []);
  groups.get(path).push(row);
}
const candidates = [],
  conflicts = [];
for (const [path, records] of groups) {
  const ids = [...new Set(records.map((row) => row.youtube_id))];
  const row = { path, sourceIds: records.map((row) => row.id), youtubeIds: ids };
  if (ids.length === 1)
    candidates.push({ ...row, destination: `https://www.youtube.com/watch?v=${ids[0]}` });
  else conflicts.push(row);
}
const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Local legacy DisplayOnSite/Processed snapshot only',
  sourceRows: rows.length,
  candidateRoutes: candidates.length,
  conflictingRoutes: conflicts.length,
  unsupportedRows: unsupported.length,
  youtubeAvailabilityVerified: false,
  policyApproved: false,
  deployed: false,
  candidates,
  conflicts,
  unsupported,
};
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
console.log(
  JSON.stringify({
    sourceRows: rows.length,
    candidateRoutes: candidates.length,
    conflictingRoutes: conflicts.length,
    unsupportedRows: unsupported.length,
    youtubeAvailabilityVerified: false,
    deployed: false,
  }),
);
