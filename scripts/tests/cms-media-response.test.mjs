import test from 'node:test';
import assert from 'node:assert/strict';
import { serveCmsMedia } from '../../src/lib/server/cms-media-response.mjs';

const filename = 'a'.repeat(64) + '.pdf';
const bytes = '%PDF-1.7\nexample';
function fixture() {
  const calls = [];
  const bucket = {
    async head(key) {
      calls.push(['head', key]);
      return {
        size: bytes.length,
        uploaded: new Date('2026-09-14T00:00:00Z'),
        etag: 'one',
        httpEtag: '"one"',
      };
    },
    async get(key, options) {
      calls.push(['get', key, options]);
      const r = options.range;
      return { body: r ? bytes.slice(r.offset, r.offset + r.length) : bytes };
    },
  };
  return {
    bucket,
    calls,
    request(headers = {}, method = 'GET', name = filename) {
      return serveCmsMedia(
        new Request(`https://astro.openstack.org/cms-media/${name}`, { headers, method }),
        bucket,
        name,
      );
    },
  };
}

test('CMS PDFs serve exact ranges inline from only the upload key', async () => {
  const f = fixture();
  const response = await f.request({ Range: 'bytes=0-7' });
  assert.equal(response.status, 206);
  assert.equal(await response.text(), '%PDF-1.7');
  assert.equal(response.headers.get('Content-Range'), `bytes 0-7/${bytes.length}`);
  assert.equal(response.headers.get('Content-Length'), '8');
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.match(response.headers.get('Content-Disposition'), /^inline;/);
  assert.equal(response.headers.get('Cache-Control'), 'private, max-age=600');
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.deepEqual(f.calls[1], [
    'get',
    `cms-proof/${filename}`,
    {
      onlyIf: { etagMatches: 'one' },
      range: { offset: 0, length: 8 },
    },
  ]);
});

test('CMS HEAD, cache validation and unsatisfiable ranges avoid body reads', async () => {
  const f = fixture();
  assert.equal((await f.request({}, 'HEAD')).headers.get('Content-Length'), String(bytes.length));
  assert.equal((await f.request({ 'If-None-Match': '"one"' })).status, 304);
  const range = await f.request({ Range: 'bytes=1000-' });
  assert.equal(range.status, 416);
  assert.equal(range.headers.get('Content-Range'), `bytes */${bytes.length}`);
  assert.ok(f.calls.every(([method]) => method === 'head'));
});

test('CMS media rejects invalid keys/methods and distinguishes missing files from storage failures', async () => {
  const f = fixture();
  assert.equal((await f.request({}, 'GET', '../private.pdf')).status, 404);
  assert.equal((await f.request({}, 'POST')).status, 405);
  assert.equal(f.calls.length, 0);
  f.bucket.head = async () => null;
  assert.equal((await f.request()).status, 404);
  f.bucket.head = async () => {
    throw new Error('private diagnostic');
  };
  const failed = await f.request();
  assert.equal(failed.status, 503);
  assert.equal(failed.headers.get('Cache-Control'), 'no-store');
  assert.doesNotMatch(await failed.text(), /private diagnostic/);
});
