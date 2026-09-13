import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import manifest from '../docs/summit-pdf-assets.json' with { type: 'json' };

const base = process.env.AUDIT_BASE ?? 'http://127.0.0.1:4401';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
for (const entry of manifest.assets) {
  const url = base + '/' + entry.path;
  const response = await fetch(url);
  assert.equal(response.status, 200, entry.path);
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.match(response.headers.get('content-disposition'), /^inline;/);
  assert.equal(response.headers.get('x-asset-source'), 'r2');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, entry.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  const partial = await fetch(url, { headers: { Range: 'bytes=0-511' } });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get('content-range'), `bytes 0-511/${entry.bytes}`);
  assert.deepEqual(Buffer.from(await partial.arrayBuffer()), bytes.subarray(0, 512));
  const head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), String(entry.bytes));
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  console.log(`Verified inline PDF, checksum, range and HEAD: ${entry.filename}`);
}
