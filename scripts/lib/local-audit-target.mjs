import assert from 'node:assert/strict';

/** Verify a harmless root HEAD before allowing public-route reads. */
export async function auditFetchFor(base, fetchImpl = globalThis.fetch) {
  assert.equal(typeof base, 'string', 'Pass a local HTTP origin and explicit port');
  assert.ok(/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(base), 'Pass a local HTTP origin and explicit port');
  const origin = new URL(base);
  const preflight = await fetchImpl(new URL('/', origin), {
    method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5000),
  });
  const message = 'Target must be the isolated Astro Worker with legacy proxy disabled';
  assert.equal(preflight.status, 200, message);
  assert.equal(preflight.headers.get('x-framework-comparison'), 'astro', message);
  assert.equal(preflight.headers.get('x-beta-legacy-proxy'), 'disabled', message);

  return async (input, options = {}) => {
    const url = new URL(input, origin);
    assert.equal(url.origin, origin.origin, 'Audit requests must stay on the verified origin');
    assert.ok(!url.username && !url.password, 'Do not send credentials in audit URLs');
    assert.ok(['GET', 'HEAD'].includes(options.method || 'GET'), 'Audits only read routes');
    return fetchImpl(url, {
      ...options, redirect: 'manual', signal: options.signal || AbortSignal.timeout(15000),
    });
  };
}
