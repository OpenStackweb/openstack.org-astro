import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_ID, relevance, selectVideos, yearAgo } from '../../src/lib/videos/selection.mjs';
import { fetchVideoFeed } from '../../src/lib/videos/youtube.mjs';
import { usableFeed, refreshVideoFeed } from '../../src/lib/videos/cache.mjs';
import { validateVideoPage } from '../../tina/videos-validation.mjs';
import { readFileSync } from 'node:fs';
const now = Date.parse('2026-09-22T00:00:00Z');
const video = (id, changes = {}) => ({
  id,
  channelId: CHANNEL_ID,
  title: 'OpenStack operations',
  publishedAt: '2026-06-01T00:00:00Z',
  public: true,
  live: false,
  views: 50,
  ...changes,
});

test('project relevance rejects channel boilerplate, ambiguous names and other-project titles', () => {
  assert.equal(relevance(video('abcdefghijk', { title: 'Nova news' })), 'ambiguous');
  assert.equal(
    relevance(
      video('abcdefghijk', {
        title: 'Cloud news',
        description: 'We build communities. The Open Infrastructure Foundation supports OpenStack.',
      }),
    ),
    'ambiguous',
  );
  assert.equal(
    relevance(video('abcdefghijk', { title: 'Kata Containers roadmap', openstackPlaylist: true })),
    'other-project',
  );
  assert.equal(
    relevance(
      video('abcdefghijk', {
        title: 'The AI Challenges Zuul Already Solved',
        description: 'We explore running AI on OpenStack.',
      }),
    ),
    'other-project',
  );
  assert.equal(
    relevance(
      video('abcdefghijk', {
        title: 'Kata Containers for operators',
        description: 'This talk demonstrates integrating Kata Containers with OpenStack.',
      }),
    ),
    'openstack-integration',
  );
  assert.equal(
    relevance(video('abcdefghijk', { title: 'Ironic Project Updates' })),
    'openstack-component',
  );
});
test('manual inclusion cannot bypass channel/privacy checks; exclusion wins', () => {
  const options = { includeIds: ['abcdefghijk'], excludeIds: ['abcdefghijk'] };
  assert.equal(relevance(video('abcdefghijk'), options), 'editor-excluded');
  assert.equal(
    relevance(video('abcdefghijk', { channelId: 'other' }), options),
    'wrong-channel-or-id',
  );
  assert.equal(relevance(video('abcdefghijk', { public: false }), options), 'unavailable');
  assert.equal(
    relevance(video('abcdefghijk', { live: true }), { includeIds: ['abcdefghijk'] }),
    'unavailable',
  );
});
test('ranking separates four newest from recent-year total views, deduplicates and excludes future dates', () => {
  const videos = Array.from({ length: 10 }, (_, i) =>
    video(`video00000${i}`, {
      publishedAt: `2026-08-${String(20 - i).padStart(2, '0')}T00:00:00Z`,
      views: i * 100,
    }),
  );
  videos.push(
    videos[0],
    video('old00000000', { publishedAt: '2024-01-01', views: 999999 }),
    video('future00000', { publishedAt: '2027-01-01', views: 999999 }),
  );
  const result = selectVideos(videos, {}, now);
  assert.deepEqual(
    result.recent.map((v) => v.id),
    ['video000000', 'video000001', 'video000002', 'video000003'],
  );
  assert.deepEqual(
    result.popular.map((v) => v.id),
    ['video000009', 'video000008', 'video000007', 'video000006'],
  );
  assert.equal(yearAgo(Date.parse('2024-02-29T00:00:00Z')), Date.parse('2023-02-28T00:00:00Z'));
});
test('cached selection expires after seven days; old API data is deleted even if refresh fails', async () => {
  assert.equal(
    usableFeed(
      { version: 1, channelId: CHANNEL_ID, videos: [], fetchedAt: '2026-09-21T00:00:00Z' },
      now,
    ),
    true,
  );
  assert.equal(
    usableFeed(
      { version: 1, channelId: CHANNEL_ID, videos: [], fetchedAt: '2026-09-01T00:00:00Z' },
      now,
    ),
    false,
  );
  const events = [];
  const MEDIA = {
    get: async () => ({ json: async () => ({ fetchedAt: '2026-08-01T00:00:00Z' }) }),
    delete: async () => events.push('delete'),
    put: async () => events.push('put'),
  };
  await assert.rejects(refreshVideoFeed({ MEDIA }, {}, fetch, now), /not configured/);
  assert.deepEqual(events, ['delete']);
});
test('YouTube API failures expose neither key nor upstream response and never replace cache', async () => {
  const calls = [];
  await assert.rejects(
    fetchVideoFeed(
      'private-test-key',
      {},
      async (url, init) => {
        calls.push({ url: String(url), headers: init.headers });
        return new Response('secret response', { status: 403 });
      },
      now,
    ),
    /^Error: YouTube returned HTTP 403$/,
  );
  assert.ok(!calls[0].url.includes('private-test-key'));
  assert.equal(calls[0].headers['X-Goog-Api-Key'], 'private-test-key');
  let writes = 0;
  await assert.rejects(
    refreshVideoFeed(
      { YOUTUBE_API_KEY: 'key', MEDIA: { get: async () => null, put: async () => writes++ } },
      {},
      async () => new Response('', { status: 503 }),
      now,
    ),
  );
  assert.equal(writes, 0);
});
test('collection rejects repeated pagination rather than publishing an incomplete ranking', async () => {
  await assert.rejects(
    fetchVideoFeed(
      'key',
      {},
      async (url) =>
        new Response(
          JSON.stringify(
            new URL(url).pathname.endsWith('/channels')
              ? { items: [{ contentDetails: { relatedPlaylists: { uploads: 'upload-list' } } }] }
              : { items: [], nextPageToken: 'same' },
          ),
        ),
      now,
    ),
    /Repeated YouTube pagination/,
  );
});
test('editor rejects invalid overrides and preserves default page fields', () => {
  const content = JSON.parse(
    readFileSync(new URL('../../src/lib/content/videos.json', import.meta.url)),
  );
  assert.deepEqual(validateVideoPage(content), content);
  assert.throws(() =>
    validateVideoPage({ ...content, includeIds: ['https://youtube.com/watch?v=abcdefghijk'] }),
  );
  assert.throws(() =>
    validateVideoPage({ ...content, includeIds: ['abcdefghijk'], excludeIds: ['abcdefghijk'] }),
  );
});

test('API collection is channel-bound, paginated and uses video publication dates/statistics', async () => {
  const calls = [];
  const fetcher = async (url) => {
    const u = new URL(url);
    calls.push(u);
    const method = u.pathname.split('/').at(-1);
    let data;
    if (method === 'channels')
      data = { items: [{ contentDetails: { relatedPlaylists: { uploads: 'uploads' } } }] };
    else if (method === 'playlists')
      data = {
        items: [
          { id: 'topic', snippet: { title: 'OpenStack Ops' } },
          { id: 'mixed', snippet: { title: 'OpenInfra Summit' } },
        ],
      };
    else if (method === 'playlistItems' && u.searchParams.get('playlistId') === 'topic')
      data = { items: [{ contentDetails: { videoId: 'topic000000' } }] };
    else if (method === 'playlistItems')
      data = {
        items: [
          {
            contentDetails: {
              videoId: u.searchParams.has('pageToken') ? 'topic000000' : 'first000000',
              videoPublishedAt: '2026-01-01T00:00:00Z',
            },
          },
        ],
        ...(!u.searchParams.has('pageToken') ? { nextPageToken: 'second' } : {}),
      };
    else
      data = {
        items: ['first000000', 'topic000000'].map((id) => ({
          id,
          snippet: {
            channelId: CHANNEL_ID,
            title: id === 'first000000' ? 'OpenStack operations' : 'Operations update',
            publishedAt: '2026-03-01T00:00:00Z',
            liveBroadcastContent: 'none',
          },
          statistics: { viewCount: '123' },
          status: { privacyStatus: 'public', embeddable: true },
        })),
      };
    return new Response(JSON.stringify(data));
  };
  const result = await fetchVideoFeed('key', {}, fetcher, now);
  assert.equal(result.audit.uploads, 2);
  assert.equal(result.videos[0].views, 123);
  assert.equal(result.videos[0].publishedAt, '2026-03-01T00:00:00Z');
  assert.equal(relevance(result.videos[1]), 'openstack-playlist');
  assert.ok(!calls.some((u) => u.searchParams.get('playlistId') === 'mixed'));
});

test('page-side cache reads never call YouTube, including a missing or expired cache', async () => {
  const { readVideoFeed } = await import('../../src/lib/videos/cache.mjs');
  const priorFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('No network access allowed while rendering');
  };
  try {
    const cached = {
      version: 1,
      channelId: CHANNEL_ID,
      videos: [video('abcdefghijk')],
      fetchedAt: '2026-09-21T00:00:00Z',
    };
    assert.deepEqual(
      await readVideoFeed({ get: async () => ({ json: async () => cached }) }, now),
      cached,
    );
    assert.equal(await readVideoFeed({ get: async () => null }, now), null);
    assert.equal(
      await readVideoFeed(
        { get: async () => ({ json: async () => ({ ...cached, fetchedAt: '2026-08-01' }) }) },
        now,
      ),
      null,
    );
  } finally {
    globalThis.fetch = priorFetch;
  }
});
