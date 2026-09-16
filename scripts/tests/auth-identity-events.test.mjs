import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/lib/auth/session.mjs';

test('Blocked browser storage settles shared identity to an error state', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('Synthetic blocked storage'); } });
  try {
    const auth = await import('../../src/lib/auth/client.js?blocked-storage-test');
    auth.configureAuth({ origin: 'https://astro.openstack.org', clientId: 'synthetic-client' });
    // A rejected background refresh would otherwise become an unhandled rejection.
    await assert.doesNotReject(auth.refreshIdentity());
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('Session events during an old profile request update shell and app identity', async () => {
  const names = ['location', 'localStorage', 'navigator', 'window', 'document', 'fetch'];
  const descriptors = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  try {
    for (const [oldStatus, action] of [[200, 'signin'], [401, 'signin'], [200, 'signout'], [401, 'signout']]) {
      const values = new Map();
      const storage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
      };
      const events = new EventTarget();
      let started, finish;
      const ready = new Promise(resolve => { started = resolve; });
      const requests = [];
      const globals = {
        location: { origin: 'https://astro.openstack.org' },
        localStorage: storage,
        navigator: { locks: { request: (_name, fn) => fn() } },
        window: events,
        document: Object.assign(new EventTarget(), { visibilityState: 'visible', cookie: '' }),
        fetch: async (_url, options) => {
          requests.push(options.headers.Authorization);
          if (requests.length === 1) {
            started();
            return new Promise(resolve => { finish = () => resolve(new Response(JSON.stringify({ id: 1, first_name: 'Old' }), { status: oldStatus })); });
          }
          return new Response(JSON.stringify({ id: 2, first_name: 'New', last_name: 'Member' }));
        },
      };
      for (const [name, value] of Object.entries(globals)) Object.defineProperty(globalThis, name, { configurable: true, value });
      const session = createSession({ storage, lock: fn => fn(), refresh: () => { throw Error('Unexpected refresh'); } });
      const save = token => session.save({ access_token: token, expires_in: 3600, profile: { sub: token } });
      save('synthetic-old');
      const auth = await import(`../../src/lib/auth/client.js?identity-event-${oldStatus}-${action}`);
      auth.configureAuth({ origin: location.origin, clientId: 'synthetic-client' });
      const shell = [], app = [];
      const unsubscribeShell = auth.subscribe(state => shell.push(state));
      const unsubscribeApp = auth.subscribe(state => app.push(state));
      try {
        await ready;
        if (action === 'signin') {
          save('synthetic-new');
          events.dispatchEvent(new Event('storage'));
        } else auth.clearSession();
        finish();
        await auth.refreshIdentity();
        for (const states of [shell, app]) {
          assert.equal(states.at(-1).status, action === 'signin' ? 'authenticated' : 'anonymous');
          assert.deepEqual(states.at(-1).member, action === 'signin' ? { id: 2, name: 'New Member' } : null);
          assert.equal(states.some(state => state.status === 'error' || state.member?.id === 1), false);
        }
        assert.deepEqual(requests, action === 'signin' ? ['Bearer synthetic-old', 'Bearer synthetic-new'] : ['Bearer synthetic-old']);
        assert.equal(session.current()?.accessToken, action === 'signin' ? 'synthetic-new' : undefined);
      } finally {
        unsubscribeShell();
        unsubscribeApp();
      }
    }
  } finally {
    for (const name of names) {
      if (descriptors[name]) Object.defineProperty(globalThis, name, descriptors[name]);
      else delete globalThis[name];
    }
  }
});
