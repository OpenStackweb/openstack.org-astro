// WordPress owns blog content. The tunnel origin accepts only this service's token.
const ORIGIN = 'https://blog-origin-staging.openstack.org';
const PUBLIC_ORIGIN = 'https://astro.openstack.org';
const BLOG_COOKIE =
  /^(wordpress(?:_[A-Za-z0-9_]+)?|wp-settings(?:-time)?-\d+|comment_author(?:_email|_url)?_[A-Za-z0-9]+)=/;

export function isBlogPath(path) {
  return path === '/blog' || path.startsWith('/blog/');
}

function unavailable() {
  return new Response('The blog is temporarily unavailable. Please try again shortly.', {
    status: 502,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function blogRedirect(location, upstreamURL) {
  const target = new URL(location, upstreamURL);
  if (!['https:', 'http:'].includes(target.protocol) || target.username || target.password) {
    throw new Error('Invalid blog redirect');
  }
  if (target.hostname.endsWith('.cloudflareaccess.com'))
    throw new Error('Origin authentication failed');
  if (target.origin === ORIGIN) {
    if (target.pathname.startsWith('/cdn-cgi/')) throw new Error('Origin authentication failed');
    target.protocol = 'https:';
    target.host = new URL(PUBLIC_ORIGIN).host;
    target.pathname = isBlogPath(target.pathname) ? target.pathname : '/blog' + target.pathname;
  } else if (target.hostname === 'www.openstack.org' && isBlogPath(target.pathname)) {
    target.protocol = 'https:';
    target.host = new URL(PUBLIC_ORIGIN).host;
  }
  return target.href;
}

export function blogCookies(value) {
  return (value || '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => BLOG_COOKIE.test(part))
    .join('; ');
}

export async function proxyBlog(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  if (!isBlogPath(url.pathname)) return null;
  if (url.pathname === '/blog') {
    return new Response(null, { status: 308, headers: { Location: '/blog/' + url.search } });
  }
  if (!env.BLOG_ACCESS_CLIENT_ID || !env.BLOG_ACCESS_CLIENT_SECRET) return unavailable();
  // Do not forward Astro login cookies, caller credentials, or arbitrary proxy headers.
  const headers = new Headers({
    'CF-Access-Client-Id': env.BLOG_ACCESS_CLIENT_ID,
    'CF-Access-Client-Secret': env.BLOG_ACCESS_CLIENT_SECRET,
    'X-Forwarded-Proto': 'https',
  });
  for (const key of [
    'accept',
    'accept-language',
    'content-type',
    'range',
    'if-range',
    'x-wp-nonce',
  ]) {
    if (request.headers.has(key)) headers.set(key, request.headers.get(key));
  }
  const cookies = blogCookies(request.headers.get('cookie'));
  if (cookies) headers.set('Cookie', cookies);
  // Preserve browser origin information for WordPress's own CSRF checks.
  for (const key of ['origin', 'referer']) {
    if (request.headers.has(key)) headers.set(key, request.headers.get(key));
  }
  const upstreamURL = new URL(url.pathname.slice('/blog'.length) + url.search, ORIGIN);
  // URL normalization must never turn an encoded or double-slash path into another origin.
  if (upstreamURL.origin !== ORIGIN) return new Response('Invalid blog path', { status: 400 });
  let upstream;
  try {
    upstream = await fetcher(upstreamURL, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return unavailable();
  }
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('set-cookie');
  responseHeaders.delete('content-length');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('etag');
  responseHeaders.set('Cache-Control', 'private, no-store');
  responseHeaders.set('X-Robots-Tag', 'noindex, nofollow');
  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  for (const cookie of upstream.headers.getSetCookie()) {
    if (!BLOG_COOKIE.test(cookie)) continue;
    // WP_HOME already supplies /blog paths. Never allow a cookie for the origin hostname.
    const scoped = cookie
      .replace(/;\s*Domain=[^;]+/gi, '')
      .replace(
        /;\s*Path=([^;]*)/i,
        (_match, path) => '; Path=' + (isBlogPath(path) ? path : '/blog/'),
      );
    responseHeaders.append('Set-Cookie', scoped);
  }
  if (responseHeaders.has('location')) {
    try {
      responseHeaders.set('Location', blogRedirect(responseHeaders.get('location'), upstreamURL));
    } catch {
      upstream.body?.cancel().catch(() => {});
      return unavailable();
    }
  }
  const response = new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
  if (!responseHeaders.get('Content-Type')?.includes('text/html') || request.method === 'HEAD')
    return response;
  // Stored articles may contain absolute production blog links. Rewrite URL attributes,
  // not post text or the database. Other external assets remain their owners' URLs.
  return new HTMLRewriter()
    .on('[href], [src], [action], [poster]', {
      element(element) {
        for (const attribute of ['href', 'src', 'action', 'poster']) {
          const value = element.getAttribute(attribute);
          if (!value) continue;
          try {
            const target = new URL(value, PUBLIC_ORIGIN);
            if (target.hostname === 'www.openstack.org' && isBlogPath(target.pathname)) {
              target.protocol = 'https:';
              target.host = new URL(PUBLIC_ORIGIN).host;
              element.setAttribute(attribute, target.href);
            }
          } catch {
            /* Preserve unrecognized content attributes. */
          }
        }
      },
    })
    .transform(response);
}
