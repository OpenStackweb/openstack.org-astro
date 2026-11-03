import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAuthConfig,
  ASTRO_AUTH_ORIGIN,
  PRODUCTION_AUTH_ORIGIN,
} from '../../src/lib/auth/config.js';
import { visitorAuthFor } from '../../src/lib/auth/availability.mjs';
import { OidcClient } from 'oidc-client-ts';

const enabled = { VISITOR_AUTH_ENABLED: 'true', VISITOR_AUTH_CLIENT_ID: 'synthetic-public-client' };

test('production login requires its explicit deployment and exact canonical origin', () => {
  assert.equal(visitorAuthFor(PRODUCTION_AUTH_ORIGIN, enabled), null);
  const config = visitorAuthFor(PRODUCTION_AUTH_ORIGIN, {
    ...enabled,
    SITE_DEPLOYMENT: 'production',
  });
  assert.equal(config.deployment, 'production');
  assert.equal(config.redirect_uri, PRODUCTION_AUTH_ORIGIN + '/auth/callback');
  assert.equal(config.post_logout_redirect_uri, PRODUCTION_AUTH_ORIGIN + '/auth/logout');
  assert.equal(
    config.scope,
    createAuthConfig({ origin: ASTRO_AUTH_ORIGIN, clientId: enabled.VISITOR_AUTH_CLIENT_ID }).scope,
  );
  assert.ok(Object.isFrozen(config));
  for (const bindings of [
    { SITE_DEPLOYMENT: 'production' },
    { ...enabled, SITE_DEPLOYMENT: 'production', VISITOR_AUTH_ENABLED: 'false' },
    { ...enabled, SITE_DEPLOYMENT: 'production', VISITOR_AUTH_CLIENT_ID: '' },
  ]) {
    assert.equal(visitorAuthFor(PRODUCTION_AUTH_ORIGIN, bindings), null);
  }
});

test('deployment profiles cannot activate login on other hosts or each others origin', () => {
  for (const deployment of ['review', 'production', 'unknown', '', true]) {
    for (const origin of [
      ASTRO_AUTH_ORIGIN,
      PRODUCTION_AUTH_ORIGIN,
      'https://openstack.org',
      'https://beta.openstack.org',
      'https://example.openstack-review.workers.dev',
      'https://astro.openstack.org.evil.invalid',
      'https://www.openstack.org.evil.invalid',
      'http://www.openstack.org',
      'http://127.0.0.1:4431',
    ]) {
      const expected =
        (deployment === 'review' && origin === ASTRO_AUTH_ORIGIN) ||
        (deployment === 'production' && origin === PRODUCTION_AUTH_ORIGIN);
      assert.equal(
        Boolean(visitorAuthFor(origin, { ...enabled, SITE_DEPLOYMENT: deployment })),
        expected,
        `${deployment}: ${origin}`,
      );
    }
  }
  assert.equal(visitorAuthFor(ASTRO_AUTH_ORIGIN, enabled).deployment, 'review');
});

test('installed OIDC client constructs production PKCE and logout requests without network access', async () => {
  const config = createAuthConfig({
    origin: PRODUCTION_AUTH_ORIGIN,
    clientId: enabled.VISITOR_AUTH_CLIENT_ID,
    deployment: 'production',
  });
  const memory = new Map();
  const oidc = new OidcClient({
    ...config,
    stateStore: {
      set: async (key, value) => {
        memory.set(key, value);
      },
      get: async (key) => memory.get(key) ?? null,
      remove: async (key) => {
        const value = memory.get(key) ?? null;
        memory.delete(key);
        return value;
      },
      getAllKeys: async () => [...memory.keys()],
    },
  });
  const signin = new URL(
    (await oidc.createSigninRequest({ nonce: 'synthetic-production-nonce' })).url,
  );
  assert.equal(signin.origin + signin.pathname, config.metadata.authorization_endpoint);
  assert.equal(signin.searchParams.get('redirect_uri'), PRODUCTION_AUTH_ORIGIN + '/auth/callback');
  assert.equal(signin.searchParams.get('code_challenge_method'), 'S256');
  assert.match(signin.searchParams.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/);
  assert.equal(signin.searchParams.get('nonce'), 'synthetic-production-nonce');
  assert.equal(signin.searchParams.get('response_type'), 'code');
  assert.equal(signin.searchParams.get('scope'), config.scope);
  const signout = new URL((await oidc.createSignoutRequest()).url);
  assert.equal(signout.origin + signout.pathname, config.metadata.end_session_endpoint);
  assert.equal(
    signout.searchParams.get('post_logout_redirect_uri'),
    PRODUCTION_AUTH_ORIGIN + '/auth/logout',
  );
});

test('coordinator cannot silently switch the same public client between origins', async () => {
  const auth = await import('../../src/lib/auth/client.js?production-switch-test');
  auth.configureAuth({ origin: ASTRO_AUTH_ORIGIN, clientId: enabled.VISITOR_AUTH_CLIENT_ID });
  assert.throws(
    () =>
      auth.configureAuth({
        origin: PRODUCTION_AUTH_ORIGIN,
        clientId: enabled.VISITOR_AUTH_CLIENT_ID,
        deployment: 'production',
      }),
    /Reload/,
  );
});

test('production coordinator refuses storage access from a different browser origin', async () => {
  const auth = await import('../../src/lib/auth/client.js?production-browser-origin-test');
  auth.configureAuth({
    origin: PRODUCTION_AUTH_ORIGIN,
    clientId: enabled.VISITOR_AUTH_CLIENT_ID,
    deployment: 'production',
  });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { origin: ASTRO_AUTH_ORIGIN },
  });
  try {
    assert.throws(auth.clearSession, /not available on this host/);
    await assert.rejects(auth.memberProfile(), /not available on this host/);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'location', previous);
    else delete globalThis.location;
  }
});
