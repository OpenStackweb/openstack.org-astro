import test from 'node:test';
import assert from 'node:assert/strict';
import { listCmsMedia } from '../../src/lib/server/cms-media-list.mjs';
const objects = Array.from({ length: 2001 }, (_, i) => ({
  key: `cms-proof/${String(i).padStart(64, '0')}.png`,
  customMetadata: { filename: `image-${i}.png` },
}));
function bucket(size = 1000) {
  const calls = [];
  return {
    calls,
    async list(options) {
      calls.push(options);
      const start = Number(options.cursor || 0);
      const end = Math.min(start + size, objects.length);
      return {
        objects: objects.slice(start, end),
        truncated: end < objects.length,
        cursor: String(end),
      };
    },
  };
}
test('search finds an upload after two R2 pages and includes registry matches afterward', async () => {
  const storage = bucket();
  const result = await listCmsMedia(
    storage,
    { 'assets/image-2000.pdf': { contentType: 'application/pdf' } },
    { search: 'IMAGE-2000' },
  );
  assert.equal(storage.calls.length, 3);
  assert.deepEqual(
    result.items.map((i) => i.filename),
    ['image-2000.png', 'assets/image-2000.pdf'],
  );
  assert.equal(result.nextOffset, undefined);
});
test('offsets cross short R2 pages without omissions and stop after one lookahead match', async () => {
  const storage = bucket(17);
  const result = await listCmsMedia(storage, {}, { offset: 58 });
  assert.deepEqual(
    result.items.map((i) => i.filename),
    objects.slice(58, 118).map((o) => o.customMetadata.filename),
  );
  assert.equal(result.nextOffset, 118);
  assert.equal(storage.calls.length, 7);
});
test('filters traverse all uploads before registry and cursor failures do not return partial success', async () => {
  const result = await listCmsMedia(
    bucket(),
    { 'assets/manual.pdf': { contentType: 'application/pdf' } },
    { extensions: ['pdf'] },
  );
  assert.equal(result.items[0].filename, 'assets/manual.pdf');
  await assert.rejects(
    listCmsMedia({ list: async () => ({ objects: [], truncated: true, cursor: 'same' }) }, {}),
    /did not advance/,
  );
  await assert.rejects(
    listCmsMedia(
      {
        list: async () => {
          throw new Error('Storage unavailable');
        },
      },
      {},
    ),
    /Storage unavailable/,
  );
});
