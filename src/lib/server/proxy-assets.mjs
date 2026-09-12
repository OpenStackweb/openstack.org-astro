// Cache only public, credential-free assets in the reviewer's browser.
// Cloudflare documents Cache API as unavailable for Workers behind Access.
const extensions = /\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|otf|eot)$/i;
export const isStaticAsset = (path) => extensions.test(path);
export function assetRequestHeaders(request) {
  const headers = { Accept: request.headers.get('Accept') || '*/*' };
  if (isStaticAsset(new URL(request.url).pathname)) {
    for (const key of ['If-None-Match', 'If-Modified-Since']) {
      const value = request.headers.get(key);
      if (value) headers[key] = value;
    }
  }
  return headers;
}
export function applyAssetCaching(request, upstream, output) {
  const path = new URL(request.url).pathname;
  const type = upstream.headers.get('Content-Type') || '';
  const control = upstream.headers.get('Cache-Control') || '';
  if (
    !isStaticAsset(path) ||
    ![200, 304].includes(upstream.status) ||
    upstream.headers.has('Set-Cookie') ||
    /private|no-store|no-cache/i.test(control) ||
    /(?:^|,)\s*(?:\*|cookie|authorization)\s*(?:,|$)/i.test(upstream.headers.get('Vary') || '')
  )
    return;
  if (
    upstream.status !== 304 &&
    !/^(?:text\/css|(?:application|text)\/(?:javascript|x-javascript)|image\/|font\/|application\/(?:font|x-font|vnd\.ms-fontobject|octet-stream))/i.test(
      type
    )
  )
    return;
  const immutable = /[.-][a-f0-9]{8,}\.(?:js|css)$/i.test(path) && path.startsWith('/software/');
  output.set(
    'Cache-Control',
    immutable ? 'private, max-age=31536000, immutable' : 'private, max-age=600'
  );
  for (const key of ['ETag', 'Last-Modified', 'Vary']) {
    const value = upstream.headers.get(key);
    if (value) output.set(key, value);
  }
}
