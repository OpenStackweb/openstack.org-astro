import { handle } from '@astrojs/cloudflare/handler';
import { refreshVideoFeed } from './lib/videos/cache.mjs';
import content from './lib/content/videos.json';
import { proxyBlog } from './lib/server/blog-gateway.mjs';

export default {
  async fetch(request: Request, env: Parameters<typeof handle>[1], context: ExecutionContext) {
    return (await proxyBlog(request, env)) || handle(request, env, context);
  },
  async scheduled(_event: ScheduledController, env: { MEDIA: R2Bucket; YOUTUBE_API_KEY?: string }) {
    // Editorial preview Workers inherit neither this schedule nor the API key.
    await refreshVideoFeed(env, content);
  },
};
