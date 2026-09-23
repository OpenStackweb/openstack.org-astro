import { CHANNEL_ID, VIDEO_ID, relevance, yearAgo, selectVideos } from './selection.mjs';

// Walk complete collections. Hitting a cap fails the refresh instead of claiming
// that a truncated sample is the channel's newest / most-viewed selection.
export async function fetchVideoFeed(apiKey, options = {}, fetcher = fetch, now = Date.now()) {
  if (!apiKey) throw new Error('YouTube API key is not configured');
  let requests = 0;
  const get = async (method, params) => {
    if (++requests > 700) throw new Error('YouTube refresh request limit reached');
    const url = new URL(`https://www.googleapis.com/youtube/v3/${method}`);
    for (const [key, value] of Object.entries(params))
      if (value) url.searchParams.set(key, String(value));
    let response;
    try {
      response = await fetcher(url, {
        headers: { 'X-Goog-Api-Key': apiKey },
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error('YouTube request failed');
    }
    if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error('Invalid YouTube collection response');
    return data;
  };
  const collection = async (method, params, maxPages = 200) => {
    const items = [],
      seen = new Set();
    let pageToken;
    for (let page = 0; page < maxPages; page++) {
      const data = await get(method, { ...params, maxResults: 50, pageToken });
      items.push(...data.items);
      pageToken = data.nextPageToken;
      if (!pageToken) return items;
      if (seen.has(pageToken)) throw new Error('Repeated YouTube pagination token');
      seen.add(pageToken);
    }
    throw new Error('YouTube pagination limit reached');
  };
  const channel = await get('channels', { id: CHANNEL_ID, part: 'contentDetails' });
  const uploads = channel.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('YouTube uploads playlist unavailable');
  const uploadItems = await collection('playlistItems', {
    playlistId: uploads,
    part: 'contentDetails',
  });
  const playlists = await collection('playlists', { channelId: CHANNEL_ID, part: 'snippet' }, 40);
  // Topic playlists only: broad event / Foundation playlists are not evidence.
  const topicPlaylists = playlists.filter(
    (p) =>
      /\bopenstack\b/i.test(p.snippet?.title || '') &&
      !/\b(summit|days?|meetups?|keynotes?)\b/i.test(p.snippet.title),
  );
  if (topicPlaylists.length > 40) throw new Error('OpenStack playlist review limit reached');
  const memberships = new Set();
  for (const playlist of topicPlaylists) {
    const items = await collection(
      'playlistItems',
      { playlistId: playlist.id, part: 'contentDetails' },
      40,
    );
    for (const item of items) memberships.add(item.contentDetails?.videoId);
  }
  // All uploads are enumerated; fetch full metadata for the rolling year plus
  // the newest 100 candidates so Recent can still work during a quiet year.
  const dated = uploadItems
    .map((item) => item.contentDetails)
    .filter((item) => VIDEO_ID.test(item?.videoId || ''));
  dated.sort((a, b) => Date.parse(b.videoPublishedAt) - Date.parse(a.videoPublishedAt));
  const ids = [
    ...new Set([
      ...dated
        .filter(
          (item) =>
            !Number.isFinite(Date.parse(item.videoPublishedAt)) ||
            Date.parse(item.videoPublishedAt) >= yearAgo(now),
        )
        .map((item) => item.videoId),
      ...dated.slice(0, 100).map((item) => item.videoId),
      ...(options.includeIds || []).filter((id) => VIDEO_ID.test(id)),
    ]),
  ];
  const videos = [];
  const readBatch = async (batch) => {
    const data = await get('videos', {
      id: batch.join(','),
      part: 'snippet,contentDetails,statistics,status',
    });
    for (const item of data.items) {
      const snippet = item.snippet || {};
      const views = Number(item.statistics?.viewCount);
      videos.push({
        id: item.id,
        channelId: snippet.channelId,
        title: snippet.title || '',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt,
        views: Number.isSafeInteger(views) && views >= 0 ? views : null,
        public: item.status?.privacyStatus === 'public',
        live: snippet.liveBroadcastContent !== 'none',
        embeddable: item.status?.embeddable === true,
        openstackPlaylist: memberships.has(item.id),
        duration: item.contentDetails?.duration || '',
      });
    }
  };
  for (let start = 0; start < ids.length; start += 50)
    await readBatch(ids.slice(start, start + 50));
  const remaining = dated.map((item) => item.videoId).filter((id) => !ids.includes(id));
  // If a quiet year or many off-topic uploads leave fewer than four matches,
  // continue backwards until Recent is filled or the channel is exhausted.
  while (selectVideos(videos, options, now).recent.length < 4 && remaining.length) {
    const batch = remaining.splice(0, 50);
    ids.push(...batch);
    await readBatch(batch);
  }
  return {
    version: 1,
    channelId: CHANNEL_ID,
    fetchedAt: new Date(now).toISOString(),
    videos,
    audit: {
      requests,
      uploads: dated.length,
      metadataCandidates: ids.length,
      topicPlaylists: topicPlaylists.map((p) => ({ id: p.id, title: p.snippet.title })),
      decisions: videos.map((video) => ({
        id: video.id,
        title: video.title,
        reason: relevance(video, options),
      })),
    },
  };
}
