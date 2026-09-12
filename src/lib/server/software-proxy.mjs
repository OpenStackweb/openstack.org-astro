import { applyAssetCaching, assetRequestHeaders, isStaticAsset } from './proxy-assets.mjs';
// Fixed, public preview origin. Never forward reviewer credentials or cookies.
const ORIGIN = 'https://software-oif-dev.netlify.app';
const inScope = (path) => path === '/software' || path.startsWith('/software/');
export async function proxySoftware(request, upstreamFetch = fetch) {
  const url = new URL(request.url);
  if (!inScope(url.pathname)) return new Response('Not found', { status: 404 });
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response('Read-only prototype', { status: 405, headers: { Allow: 'GET, HEAD' } });
  // Reject encoded separators and dot segments before passing them to an upstream router.
  if (/%(?:2e|2f|5c)|\\/i.test(url.pathname)) return new Response('Invalid path', { status: 400 });
  const target = new URL(url.pathname, ORIGIN);
  if (isStaticAsset(url.pathname))
    for (const key of ['v', 'm']) {
      const value = url.searchParams.get(key);
      if (value && /^[A-Za-z0-9._-]{1,80}$/.test(value)) target.searchParams.set(key, value);
    }
  // Only static asset version parameters are forwarded in this public catalog preview.
  let upstream;
  const start = performance.now();
  try {
    upstream = await upstreamFetch(target, {
      method: request.method,
      redirect: 'manual',
      credentials: 'omit',
      headers: assetRequestHeaders(request),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return new Response('The software preview is unavailable. Please try again later.', {
      status: 502,
    });
  }
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  headers.set('Server-Timing', `upstream;dur=${(performance.now() - start).toFixed(1)}`);
  headers.set('X-Beta-Route', 'software');
  applyAssetCaching(request, upstream, headers);
  const type = upstream.headers.get('Content-Type');
  if (type) headers.set('Content-Type', type);
  if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) {
    const location = upstream.headers.get('Location');
    if (!location) return new Response('Invalid upstream redirect', { status: 502 });
    const next = new URL(location, target);
    if (next.origin !== ORIGIN || !inScope(next.pathname))
      return new Response('Upstream redirect leaves the software preview', { status: 502 });
    headers.set('Location', next.pathname + next.search);
    return new Response(null, { status: upstream.status, headers });
  }
  // Keep Gatsby's same-origin bundles, but disable forms, embedded pages,
  // third-party scripts, cross-origin API calls, and background worker registration.
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; form-action 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
  );
  return new Response(
    request.method === 'HEAD' || [204, 205, 304].includes(upstream.status) ? null : upstream.body,
    { status: upstream.status, headers }
  );
}
