import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMemberProfile } from '../../src/lib/auth/member-profile.mjs';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function fixture() {
  let generation = 'first', token = 'synthetic-first', clears = 0;
  const started = deferred(), response = deferred();
  const session = { epoch: () => generation, current: () => token ? { accessToken: token } : null };
  return {
    started,
    response,
    session,
    clears: () => clears,
    change: (nextGeneration, nextToken) => { generation = nextGeneration; token = nextToken; },
    load: () => loadMemberProfile({
      session,
      accessToken: async () => token,
      clearSession: () => { clears++; generation = 'cleared'; token = null; },
      endpoint: 'https://member-api.invalid/me',
      fetchProfile: async (url, options) => {
        assert.equal(url, 'https://member-api.invalid/me');
        assert.equal(options.credentials, 'omit');
        assert.equal(options.cache, 'no-store');
        started.resolve();
        return response.promise;
      },
    }),
  };
}

for (const [label, generation, token] of [
  ['new sign-in', 'second', 'synthetic-second'],
  ['refresh in the same session', 'first', 'synthetic-refreshed'],
  ['sign-out', 'signed-out', null],
]) {
  test(`late profile 401 cannot invalidate ${label}`, async () => {
    const f = fixture();
    const pending = f.load();
    await f.started.promise;
    f.change(generation, token);
    f.response.resolve({ status: 401, ok: false });
    await assert.rejects(pending, /session changed/);
    assert.equal(f.clears(), 0);
    assert.equal(f.session.current()?.accessToken ?? null, token);
  });
}

test('current profile 401 clears its own expired session', async () => {
  const f = fixture();
  const pending = f.load();
  await f.started.promise;
  f.response.resolve({ status: 401, ok: false });
  await assert.rejects(pending, /session has expired/);
  assert.equal(f.clears(), 1);
  assert.equal(f.session.current(), null);
});

test('profile decoding cannot return an identity after the session changes', async () => {
  const f = fixture(), decoding = deferred(), body = deferred();
  const pending = f.load();
  await f.started.promise;
  f.response.resolve({ status: 200, ok: true, json: () => { decoding.resolve(); return body.promise; } });
  await decoding.promise;
  f.change('second', 'synthetic-second');
  body.resolve({ id: 1, first_name: 'Synthetic', last_name: 'First' });
  await assert.rejects(pending, /session changed/);
  assert.equal(f.clears(), 0);
});

test('successful profile exposes only display fields and supplies an empty-name fallback', async () => {
  const f = fixture();
  const pending = f.load();
  await f.started.promise;
  f.response.resolve({ status: 200, ok: true, json: async () => ({ id: 7, first_name: '', last_name: '', email: 'synthetic@example.invalid' }) });
  assert.deepEqual(await pending, { id: 7, name: 'My account', email: 'synthetic@example.invalid' });
});

test('service authorization failure retains the current session', async () => {
  const f = fixture();
  const pending = f.load();
  await f.started.promise;
  f.response.resolve({ status: 403, ok: false });
  await assert.rejects(pending, /account could not be loaded/);
  assert.equal(f.clears(), 0);
});

test('profile details use a typed allowlist and discard arbitrary private expansions', async () => {
  const f = fixture();
  const pending = f.load();
  await f.started.promise;
  f.response.resolve({ status: 200, ok: true, json: async () => ({
    id: 8, first_name: 'Synthetic', last_name: 'Member', email: 'synthetic@example.invalid',
    bio: '<script>synthetic</script>', country: 'US', display_on_site: false,
    subscribed_to_newsletter: true, company: {private: true}, groups: ['private'],
    legal_agreements: ['private'], access_token: 'synthetic-secret',
  }) });
  assert.deepEqual(await pending, {
    id: 8, name: 'Synthetic Member', email: 'synthetic@example.invalid',
    bio: '<script>synthetic</script>', country: 'US', display_on_site: false,
    subscribed_to_newsletter: true,
  });
});
for (const value of [null, [], 'invalid']) test('invalid profile response is rejected: ' + JSON.stringify(value), async () => {
  const f = fixture(); const pending = f.load(); await f.started.promise;
  f.response.resolve({status:200,ok:true,json:async()=>value});
  await assert.rejects(pending, /account could not be loaded/);
});
