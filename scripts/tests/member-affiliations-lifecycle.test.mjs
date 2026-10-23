import test from 'node:test';
import assert from 'node:assert/strict';

test('the profile child initializes its own auth before a parent or header has subscribed', async () => {
  // Minimal custom-element host: authentication is real, with empty local storage.
  // This exercises initial upgrade ordering without browser credentials/network.
  const definitions = new Map();
  globalThis.HTMLElement = class {
    isConnected = true;
    hidden = false;
    closest() {
      return { dataset: { clientId: 'synthetic-affiliation-lifecycle' } };
    }
    replaceChildren() {}
  };
  globalThis.customElements = {
    get: (name) => definitions.get(name),
    define: (name, constructor) => definitions.set(name, constructor),
  };
  globalThis.location = { origin: 'https://astro.openstack.org' };
  globalThis.localStorage = { getItem: () => null };
  globalThis.window = new EventTarget();
  globalThis.document = new EventTarget();
  await import('../../src/lib/auth/affiliations-element.js');
  const Element = definitions.get('member-affiliations');
  const element = new Element();
  await element.connectedCallback();
  const auth = await import('../../src/lib/auth/client.js');
  assert.throws(
    () => auth.configureAuth({ origin: location.origin, clientId: 'different-client' }),
    /changing/,
  );
  assert.equal(element.textContent, undefined);
  element.disconnectedCallback();
});
