import { pageRobots } from './lib/indexing.mjs';
import { paperDownloadAssetFor } from './lib/server/paper-downloads.mjs';
import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { serveMedia } from './lib/server/media-assets.mjs';
import registry from './lib/content/media.json';
import redirects from './lib/content/redirects.json';
import { redirectLocation } from './lib/server/redirect-location.mjs';
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const pdf = /\/pdf\/?$/.test(path)
    ? paperDownloadAssetFor(
        path.replace(/pdf\/?$/, ''),
        context.url.searchParams.get('lang') || 'en_US',
      )
    : null;
  const redirect = redirects.find((row) => row.from === (path.endsWith('/') ? path : path + '/'));
  let response;
  if (pdf)
    response = new Response(null, {
      status: 302,
      headers: { Location: pdf },
    });
  else if (redirect) {
    response = new Response(null, {
      status: redirect.status,
      headers: {
        Location: redirectLocation(redirect, context.url),
        ...(redirect.status === 302 ? { 'Cache-Control': 'private, no-store' } : {}),
      },
    });
  } else response = (await serveMedia(context.request, env.MEDIA, registry, env)) || (await next());
  if (response.headers.get('Content-Type')?.toLowerCase().includes('text/html'))
    response.headers.set('X-Robots-Tag', pageRobots(context.url, env, response.status));
  else if (!response.headers.has('X-Robots-Tag'))
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('X-Framework-Comparison', 'astro');
  response.headers.set('X-Beta-Legacy-Proxy', 'disabled');
  // Review HTML must be revalidated after publishing. Preserve stricter policies
  // from auth/editor endpoints and the independent media/hashed-asset policies.
  if (
    response.headers.get('Content-Type')?.toLowerCase().includes('text/html') &&
    !response.headers.has('Cache-Control')
  )
    response.headers.set('Cache-Control', 'private, no-cache');
  // Static responses use public/_headers; cover Worker-rendered entrypoints too.
  if (['/admin', '/admin/', '/admin/index.html', '/admin/bridge.js'].includes(path))
    response.headers.set('Cache-Control', 'no-store');
  return response;
});
