import test from 'node:test';
import assert from 'node:assert/strict';
import { visitorAuthFor } from '../../src/lib/auth/availability.mjs';

test('Visitor routes require explicit runtime opt-in and a valid public client', () => {
  const origin = 'https://astro.openstack.org';
  for (const bindings of [undefined, {}, { VISITOR_AUTH_CLIENT_ID: 'synthetic' },
    { VISITOR_AUTH_ENABLED: true, VISITOR_AUTH_CLIENT_ID: 'synthetic' },
    { VISITOR_AUTH_ENABLED: 'false', VISITOR_AUTH_CLIENT_ID: 'synthetic' },
    { VISITOR_AUTH_ENABLED: 'true' },
    { VISITOR_AUTH_ENABLED: 'true', VISITOR_AUTH_CLIENT_ID: 'bad client' }]) {
    assert.equal(visitorAuthFor(origin, bindings), null);
  }
  const config = visitorAuthFor(origin, { VISITOR_AUTH_ENABLED: 'true', VISITOR_AUTH_CLIENT_ID: 'synthetic' });
  assert.equal(config.client_id, 'synthetic');
  assert.equal(config.redirect_uri, origin + '/auth/callback');
});

test('Runtime opt-in cannot activate visitor auth on production, beta or editorial previews', () => {
  for (const origin of ['https://www.openstack.org', 'https://beta.openstack.org',
    'https://example.openstack-review.workers.dev', 'http://127.0.0.1:4591',
    'https://astro.openstack.org.example.invalid']) {
    assert.equal(visitorAuthFor(origin, { VISITOR_AUTH_ENABLED: 'true', VISITOR_AUTH_CLIENT_ID: 'synthetic' }), null);
  }
});
