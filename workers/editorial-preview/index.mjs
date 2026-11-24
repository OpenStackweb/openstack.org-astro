/** Keep immutable editorial previews on OpenStack's domain.
 * Cloudflare Access protects this hostname using the SAME application as the
 * version origin. The origin independently verifies the forwarded Access JWT.
 * No origin credential, production cookie or user-supplied upstream is accepted.
 */
export async function previewGateway(request, fetcher = fetch) {
  const url = new URL(request.url);
  const version = /^([a-f0-9]{8})\.astro\.openstack\.org$/.exec(url.hostname)?.[1];
  const fail = (message, status) =>
    new Response(message, {
      status,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  if (!version || url.protocol !== 'https:') return fail('Preview not found.', 404);
  if (!['GET', 'HEAD'].includes(request.method)) return fail('Previews are read-only.', 405);
  if (/^\/(admin|auth|logout)(\/|$)/.test(url.pathname))
    return fail('Edit content at https://www.openstack.org/admin/.', 403);
  const assertion = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!assertion || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(assertion))
    return fail('Sign in through Cloudflare Access to view this preview.', 403);
  const origin = `https://${version}-openstack-org-astro-editorial.openstack-review.workers.dev`;
  const upstream = new URL(url.pathname + url.search, origin);
  const headers = new Headers();
  for (const key of ['accept', 'accept-language', 'range', 'if-none-match', 'if-modified-since']) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set('Cookie', `CF_Authorization=${assertion}`);
  let response;
  try {
    response = await fetcher(upstream, {
      method: request.method,
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return fail('Preview temporarily unavailable. Please try again.', 502);
  }
  const outgoing = new Headers(response.headers);
  const location = outgoing.get('location');
  if (location) {
    const destination = new URL(location, origin);
    // An origin Access challenge means our shared-audience setup is incomplete
    // or the session expired. Never send the browser back to workers.dev.
    if (destination.hostname.endsWith('.cloudflareaccess.com'))
      return fail('Preview sign-in expired or could not be verified. Sign in again.', 403);
    if (destination.origin === origin) {
      destination.host = url.host;
      outgoing.set('location', destination.href);
    }
  }
  outgoing.delete('set-cookie');
  outgoing.set('Cache-Control', 'private, no-store');
  outgoing.set('X-Robots-Tag', 'noindex, nofollow');
  outgoing.set('Referrer-Policy', 'same-origin');
  return new Response(response.body, { status: response.status, headers: outgoing });
}
export default { fetch: (request) => previewGateway(request) };
