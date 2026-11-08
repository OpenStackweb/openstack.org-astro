import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { secureResponse, securityHeaders } from '../../src/lib/server/security-headers.mjs';

test('static and Worker security policies remain aligned', () => {
  const staticHeaders = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8');
  for (const [name, value] of Object.entries(securityHeaders))
    assert.ok(staticHeaders.includes(`  ${name}: ${value}`));
});
test('immutable redirects preserve destination and status', () => {
  const response = secureResponse(Response.redirect('https://www.openstack.org/', 301));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://www.openstack.org/');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});
test('proxy body, cookies, cache and existing policies survive', async () => {
  const response = secureResponse(
    new Response('blog', {
      headers: {
        'Content-Security-Policy': "script-src 'self'",
        'Cache-Control': 'private, no-store',
        'Set-Cookie': 'session=test; Secure; HttpOnly',
      },
    }),
  );
  assert.equal(await response.text(), 'blog');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('set-cookie'), 'session=test; Secure; HttpOnly');
  assert.ok(response.headers.get('content-security-policy').startsWith("script-src 'self',"));
});
