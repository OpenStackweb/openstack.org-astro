import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { serveMedia } from '../../src/lib/server/media-assets.mjs';

const bytes = '0123456789';
const uploaded = new Date('2026-09-01T12:00:00Z');
const registry = {
  'assets/example.pdf': {
    sha256: 'a'.repeat(64),
    bytes: 10,
    contentType: 'application/pdf',
    disposition: 'inline',
  },
};

test('every published media entry can be served with its registered type and size', async () => {
  const published = JSON.parse(
    await readFile(new URL('../../src/lib/content/media.json', import.meta.url), 'utf8'),
  );
  for (const [key, entry] of Object.entries(published)) {
    let bodyReads = 0;
    const bucket = {
      async head(objectKey) {
        assert.equal(objectKey, `legacy/${entry.sha256}`, key);
        return { size: entry.bytes, uploaded, etag: 'one', httpEtag: '"one"' };
      },
      async get() {
        bodyReads++;
        throw new Error('HEAD must not read bytes');
      },
    };
    const response = await serveMedia(
      new Request(`https://astro.openstack.org/${key}`, { method: 'HEAD' }),
      bucket,
      published,
    );
    assert.equal(response?.status, 200, key);
    assert.equal(response.headers.get('Content-Type'), entry.contentType, key);
    assert.equal(response.headers.get('Content-Length'), String(entry.bytes), key);
    assert.equal(bodyReads, 0, key);
  }
});

test('archived calendar files download with their original name and calendar MIME type', async () => {
  const key = 'assets/industry-downloads/edge/example.ics';
  const calendar = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n';
  const entries = {
    [key]: { sha256: 'a'.repeat(64), bytes: calendar.length, contentType: 'text/calendar' },
  };
  const bucket = {
    async head() {
      return { size: calendar.length, uploaded, etag: 'one', httpEtag: '"one"' };
    },
    async get() {
      return { body: calendar };
    },
  };
  const response = await serveMedia(
    new Request(`https://astro.openstack.org/${key}`),
    bucket,
    entries,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'text/calendar');
  assert.equal(
    response.headers.get('Content-Disposition'),
    "attachment; filename*=UTF-8''example.ics",
  );
  assert.equal(await response.text(), calendar);
});
function fixture() {
  const calls = [];
  const bucket = {
    async head() {
      return { size: 10, uploaded, etag: 'version-one', httpEtag: '"version-one"' };
    },
    async get(key, options) {
      calls.push({ key, options });
      const r = options.range;
      return { body: r ? bytes.slice(r.offset, r.offset + r.length) : bytes };
    },
  };
  return {
    bucket,
    calls,
    request: (headers = {}, method = 'GET') =>
      serveMedia(
        new Request('https://astro.openstack.org/assets/example.pdf', { headers, method }),
        bucket,
        registry,
      ),
  };
}

test('PDF ranges return exact bytes and preserve inline delivery', async () => {
  for (const [range, body, contentRange] of [
    ['bytes=2-5', '2345', 'bytes 2-5/10'],
    ['bytes=-3', '789', 'bytes 7-9/10'],
    ['bytes=8-', '89', 'bytes 8-9/10'],
  ]) {
    const f = fixture();
    const response = await f.request({ Range: range });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), contentRange);
    assert.equal(response.headers.get('Content-Length'), String(body.length));
    assert.match(response.headers.get('Content-Disposition'), /^inline;/);
    assert.equal(await response.text(), body);
    assert.deepEqual(f.calls[0].options.onlyIf, { etagMatches: 'version-one' });
  }
});

test('If-Range requires a matching validator, including exact modification dates', async () => {
  for (const [validator, status] of [
    ['"version-one"', 206],
    ['W/"version-one"', 200],
    ['"old"', 200],
    [uploaded.toUTCString(), 206],
    ['Wed, 02 Sep 2026 12:00:00 GMT', 200],
    ['Mon, 31 Aug 2026 12:00:00 GMT', 200],
    ['invalid', 200],
  ]) {
    const response = await fixture().request({ Range: 'bytes=2-5', 'If-Range': validator });
    assert.equal(response.status, status, validator);
    assert.equal(await response.text(), status === 206 ? '2345' : bytes);
  }
});

test('cache validation and HEAD avoid reading the object body', async () => {
  const f = fixture();
  const cached = await f.request({ 'If-None-Match': 'W/"version-one"', Range: 'bytes=2-5' });
  assert.equal(cached.status, 304);
  assert.equal(await cached.text(), '');
  const head = await f.request({ Range: 'bytes=2-5' }, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Length'), '10');
  assert.equal(await head.text(), '');
  assert.equal(f.calls.length, 0);
  const precedence = await f.request({
    'If-None-Match': '"old"',
    'If-Modified-Since': 'Wed, 02 Sep 2026 12:00:00 GMT',
  });
  assert.equal(precedence.status, 200);
});

test('unsatisfiable ranges and changed R2 objects never return misleading partial bytes', async () => {
  const f = fixture();
  const invalid = await f.request({ Range: 'bytes=10-' });
  assert.equal(invalid.status, 416);
  assert.equal(invalid.headers.get('Content-Range'), 'bytes */10');
  assert.equal(f.calls.length, 0);
  f.bucket.get = async () => ({});
  const changed = await f.request({ Range: 'bytes=2-5' });
  assert.equal(changed.status, 503);
  assert.equal(changed.headers.get('Cache-Control'), 'no-store');
});

test('Illustrator artwork downloads preserve the source filename and never render inline', async () => {
  const { bucket } = fixture();
  const key = 'assets/marketing/OpenStack-Sticker.ai';
  const entries = {
    [key]: {
      sha256: 'a'.repeat(64),
      bytes: 10,
      contentType: 'application/postscript',
      disposition: 'inline',
    },
  };
  const response = await serveMedia(
    new Request(`https://astro.openstack.org/${key}`),
    bucket,
    entries,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/postscript');
  assert.equal(
    response.headers.get('Content-Disposition'),
    "attachment; filename*=UTF-8''OpenStack-Sticker.ai",
  );
  assert.equal(await response.text(), bytes);
});
