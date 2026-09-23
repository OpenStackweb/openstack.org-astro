import { CHANNEL_ID } from './selection.mjs';
import { fetchVideoFeed } from './youtube.mjs';
export const FEED_KEY = '_feeds/astro/openstack-videos-v1.json';
const DAY = 86400000;
export function usableFeed(feed, now = Date.now()) {
  const age = now - Date.parse(feed?.fetchedAt);
  return (
    feed?.version === 1 &&
    feed.channelId === CHANNEL_ID &&
    Array.isArray(feed.videos) &&
    age >= 0 &&
    age < 7 * DAY
  );
}
export async function readVideoFeed(bucket, now = Date.now()) {
  if (!bucket) return null;
  try {
    const object = await bucket.get(FEED_KEY);
    const feed = object ? await object.json() : null;
    return usableFeed(feed, now) ? feed : null;
  } catch {
    return null;
  }
}
export async function refreshVideoFeed(env, options, fetcher = fetch, now = Date.now()) {
  if (!env.MEDIA) throw new Error('Video feed storage is not configured');
  // Never retain unrefreshed API data beyond YouTube's 30-day retention limit.
  const prior = await env.MEDIA.get(FEED_KEY);
  if (prior && now - Date.parse((await prior.json()).fetchedAt) >= 28 * DAY)
    await env.MEDIA.delete(FEED_KEY);
  const feed = await fetchVideoFeed(env.YOUTUBE_API_KEY, options, fetcher, now);
  await env.MEDIA.put(FEED_KEY, JSON.stringify(feed), {
    httpMetadata: { contentType: 'application/json' },
  });
  return feed;
}
