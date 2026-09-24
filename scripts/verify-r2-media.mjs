// Read only: download exact Git-registered R2 objects and verify their bytes.
// No bucket listing, uploads, deletions, or production-origin requests.
import { readFile, writeFile, mkdtemp, unlink, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

const reportPath = process.argv[2];
assert.ok(reportPath, 'Provide an output report path');
const registryBytes = await readFile(new URL('../src/lib/content/media.json', import.meta.url));
const registry = JSON.parse(registryBytes);
const objects = new Map();
for (const [path, entry] of Object.entries(registry)) {
  assert.match(entry.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0);
  const prior = objects.get(entry.sha256);
  if (prior) { assert.equal(prior.bytes, entry.bytes); prior.paths.push(path); }
  else objects.set(entry.sha256, { sha256: entry.sha256, bytes: entry.bytes, paths: [path] });
}
// An incremental run verifies only objects absent from the prior successful
// report. It does not refresh the date or certify current bytes for skipped objects.
const baselinePath = process.argv[3];
let baseline = null;
let entries = [...objects.values()];
if (baselinePath) {
  assert.notEqual(resolve(reportPath), resolve(baselinePath), 'Keep the historical baseline report unchanged');
  const bytes = await readFile(baselinePath);
  const prior = JSON.parse(bytes);
  assert.equal(prior.bucket, 'openstack-org-beta-media');
  assert.equal(prior.prefix, 'legacy/');
  assert.equal(prior.complete, true, 'Baseline must be a complete audit');
  assert.equal(prior.failures.length, 0, 'Baseline must have no failures');
  assert.equal(prior.results.length, prior.verified);
  const verified = new Map(prior.results.map(row => {
    assert.equal(row.status, 'verified');
    return [row.sha256, row.bytes];
  }));
  entries = entries.filter(entry => verified.get(entry.sha256) !== entry.bytes);
  baseline = {
    reportSha256: createHash('sha256').update(bytes).digest('hex'),
    completedAt: prior.completedAt,
    historicallyVerifiedObjects: objects.size - entries.length,
    limitation: 'These objects are not read again by this incremental run.',
  };
}
const directory = await mkdtemp(join(tmpdir(), 'openstack-r2-verification-'));
const report = {
  startedAt: new Date().toISOString(), completedAt: null,
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  registrySha256: createHash('sha256').update(registryBytes).digest('hex'),
  bucket: 'openstack-org-beta-media', prefix: 'legacy/',
  operation: 'Read-only exact-object GET and SHA-256/size verification',
  scope: baseline ? 'Objects not covered by the supplied historical baseline' : 'All registered objects',
  baseline, registeredObjects: objects.size, registeredAliases: Object.keys(registry).length,
  expectedObjects: entries.length, expectedAliases: entries.reduce((n, entry) => n + entry.paths.length, 0),
  expectedBytes: entries.reduce((n, entry) => n + entry.bytes, 0),
  complete: false, verified: 0, failures: [], results: [],
};
let cursor = 0;
let stopped = false;
let save = Promise.resolve();
function checkpoint() {
  const snapshot = JSON.stringify(report, null, 2) + '\n';
  save = save.then(() => writeFile(resolve(reportPath), snapshot));
  return save;
}
function download(key, file) {
  return new Promise(resolveResult => {
    const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'r2', 'object', 'get',
      `openstack-org-beta-media/legacy/${key}`, '--remote', '--profile', 'openinfra', '--file', file],
    { stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    child.on('error', () => resolveResult({ status: -1, missing: false }));
    child.on('close', status => resolveResult({ status, missing: output.includes('The specified key does not exist.') }));
  });
}
await checkpoint();
try {
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (!stopped && cursor < entries.length) {
      const entry = entries[cursor++];
      const file = join(directory, entry.sha256);
      let status;
      try {
        const result = await download(entry.sha256, file);
        if (result.status !== 0) {
          status = result.missing ? 'missing' : 'read-failed';
          // Avoid a flood of requests after auth/network failures. Missing
          // objects are independent findings, so the remaining audit proceeds.
          if (!result.missing) stopped = true;
        } else {
          const bytes = await readFile(file);
          status = bytes.length !== entry.bytes ? 'size-mismatch'
            : createHash('sha256').update(bytes).digest('hex') !== entry.sha256 ? 'checksum-mismatch' : 'verified';
        }
      } catch { status = 'verification-failed'; stopped = true; }
      finally { await unlink(file).catch(() => {}); }
      const row = { ...entry, status, checkedAt: new Date().toISOString() };
      report.results.push(row);
      if (status === 'verified') report.verified++;
      else report.failures.push(row);
      await checkpoint();
      if (report.results.length % 25 === 0 || status !== 'verified')
        console.log(JSON.stringify({ checked: report.results.length, expected: entries.length,
          verified: report.verified, failures: report.failures.length, status }));
    }
  }));
  report.complete = report.results.length === entries.length;
  report.completedAt = new Date().toISOString();
  await checkpoint();
  console.log(JSON.stringify({ complete: report.complete, verified: report.verified,
    expected: entries.length, failures: report.failures.length }));
  if (!report.complete || report.failures.length) process.exitCode = 1;
} finally {
  // This directory was created exclusively by this invocation.
  await rm(directory, { recursive: true, force: true });
}
