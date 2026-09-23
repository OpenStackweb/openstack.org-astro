import { handle } from '@astrojs/cloudflare/handler';
import { refreshVideoFeed } from './lib/videos/cache.mjs';
import content from './lib/content/videos.json';

export default {
  fetch: handle,
  async scheduled(_event: ScheduledController, env: { MEDIA: R2Bucket; YOUTUBE_API_KEY?: string }) {
    // Editorial preview Workers inherit neither this schedule nor the API key.
    await refreshVideoFeed(env, content);
  },
};
