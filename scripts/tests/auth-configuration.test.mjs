import test from 'node:test';
import assert from 'node:assert/strict';
import { ASTRO_AUTH_ORIGIN, createAuthConfig, authReturnPath } from '../../src/lib/auth/config.js';

test('Astro configuration requires an explicit public client and exact approved host', () => {
  for (const origin of ['https://beta.openstack.org', 'https://www.openstack.org', 'http://astro.openstack.org', 'https://astro.openstack.org/', 'https://astro.openstack.org.evil.invalid']) {
    assert.throws(() => createAuthConfig({ origin, clientId: 'synthetic-public-client' }), /host/);
  }
  for (const clientId of [undefined, '', 'with space', 'line\nbreak', 'x'.repeat(257)]) {
    assert.throws(() => createAuthConfig({ origin: ASTRO_AUTH_ORIGIN, clientId }), /client ID/);
  }
  const config = createAuthConfig({ origin: ASTRO_AUTH_ORIGIN, clientId: 'synthetic.public~client' });
  assert.equal(config.redirect_uri, ASTRO_AUTH_ORIGIN + '/auth/callback');
  assert.equal(config.post_logout_redirect_uri, ASTRO_AUTH_ORIGIN + '/auth/logout');
  assert.equal(config.client_id, 'synthetic.public~client');
  assert.equal(config.response_type, 'code');
  assert.ok(Object.isFrozen(config));
  assert.ok(Object.isFrozen(config.metadata));
});

test('Unconfigured coordinator cannot start login or read/clear a session', async () => {
  const auth = await import('../../src/lib/auth/client.js?unconfigured-test');
  await assert.rejects(auth.beginLogin('/software/'), /not been configured/);
  await assert.rejects(auth.login('/software/'), /not been configured/);
  await assert.rejects(auth.memberProfile(), /not been configured/);
  assert.throws(auth.clearSession, /not been configured/);
  assert.throws(() => auth.subscribe(() => {}), /not been configured/);
});

test('Shell and app initialize the same coordinator without silently switching clients', async () => {
  const auth = await import('../../src/lib/auth/client.js?configured-test');
  const options = { origin: ASTRO_AUTH_ORIGIN, clientId: 'synthetic-public-client' };
  const first = auth.configureAuth(options);
  assert.equal(auth.configureAuth(options), first);
  assert.throws(() => auth.configureAuth({ ...options, clientId: 'different-client' }), /Reload/);
});

test('Return paths remain local and exclude callback and external destinations', () => {
  assert.equal(authReturnPath('/software/sample-configs/?release=newton#ecommerce'), '/software/sample-configs/?release=newton#ecommerce');
  for (const path of ['https://example.invalid/', '//example.invalid/', '/\\example.invalid/', '/auth/callback?code=synthetic', '/%2fexample.invalid/']) {
    assert.equal(authReturnPath(path), '/');
  }
});

test('Configured coordinator checks the actual browser origin before accessing storage', async () => {
  const auth = await import('../../src/lib/auth/client.js?wrong-host-test');
  auth.configureAuth({ origin: ASTRO_AUTH_ORIGIN, clientId: 'synthetic-public-client' });
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { origin: 'https://beta.openstack.org' } });
  try {
    assert.throws(auth.clearSession, /not available on this host/);
    await assert.rejects(auth.memberProfile(), /not available on this host/);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'location', descriptor);
    else delete globalThis.location;
  }
});

test('Installed OIDC client creates an Astro PKCE request using memory state and fixed metadata', async () => {
  const { OidcClient } = await import('oidc-client-ts');
  const memory = new Map();
  const config = createAuthConfig({ origin: ASTRO_AUTH_ORIGIN, clientId: 'synthetic-public-client' });
  const oidc = new OidcClient({
    ...config,
    stateStore: {
      set: async (key, value) => { memory.set(key, value); },
      get: async key => memory.get(key) ?? null,
      remove: async key => { const value = memory.get(key) ?? null; memory.delete(key); return value; },
      getAllKeys: async () => [...memory.keys()],
    },
  });
  const request = await oidc.createSigninRequest({ state: { back: '/software/' }, nonce: 'synthetic-nonce' });
  const url = new URL(request.url);
  assert.equal(url.origin + url.pathname, config.metadata.authorization_endpoint);
  assert.equal(url.searchParams.get('client_id'), 'synthetic-public-client');
  assert.equal(url.searchParams.get('redirect_uri'), ASTRO_AUTH_ORIGIN + '/auth/callback');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.match(url.searchParams.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/);
  assert.equal(url.searchParams.get('nonce'), 'synthetic-nonce');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(memory.size, 1);
});
