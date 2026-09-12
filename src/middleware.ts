import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { serveMedia } from './lib/server/media-assets.mjs';
import registry from './lib/content/media.json';
import redirects from './lib/content/redirects.json';
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const redirect = redirects.find((row) => row.from === (path.endsWith('/') ? path : path + '/'));
  let response;
  if (redirect)
    response = new Response(null, { status: redirect.status, headers: { Location: redirect.to } });
  else response = (await serveMedia(context.request, env.MEDIA, registry)) || (await next());
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Framework-Comparison', 'astro');
  response.headers.set('X-Beta-Legacy-Proxy', 'disabled');
  return response;
});
