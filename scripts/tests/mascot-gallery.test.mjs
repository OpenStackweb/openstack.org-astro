import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMascotGallery } from '../../src/lib/server/mascot-gallery.mjs';
test('mascot gallery only renders safe public download links', async () => {
  const result = await loadMascotGallery(async () =>
    Response.json({
      mascots: [
        {
          project: 'Nova',
          name: 'Cat',
          downloads: [
            { label: 'PNG', url: 'https://example.org/nova.png' },
            { label: 'Invalid', url: 'javascript:alert(1)' },
            { label: 'Credentials', url: 'https://secret@example.org/a.png' },
          ],
        },
      ],
    }),
  );
  assert.equal(result.available, true);
  assert.equal(result.mascots[0].downloads.length, 1);
});
test('mascot service errors produce an unavailable state, not an empty success', async () => {
  for (const response of [new Response('', { status: 503 }), Response.json({})]) {
    const result = await loadMascotGallery(async () => response);
    assert.deepEqual(result, { available: false, mascots: [] });
  }
  assert.deepEqual(await loadMascotGallery(async () => Response.json({ mascots: [] })), {
    available: true,
    mascots: [],
  });
});
