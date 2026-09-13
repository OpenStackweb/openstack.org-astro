import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../../src/lib/auth/session.mjs';
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,String(value)), removeItem: key => values.delete(key) };
};
const initial = { access_token:'old-test-token', refresh_token:'refresh-test-token', id_token:'test-id', expires_in:1, profile:{sub:'test-member'} };
const refreshed = { ...initial, access_token:'renewed-test-token', expires_in:3600 };
function serialLock() {
  let previous = Promise.resolve();
  return fn => { const current = previous.then(fn); previous = current.catch(() => {}); return current; };
}
test('Site and app session consumers share one refresh and its updated token', async () => {
  const shared = storage(); const lock = serialLock(); let calls=0;
  const options = { storage:shared, lock, now:()=>100000, refresh:async () => { calls++; return refreshed; } };
  const site = createSession(options); const app = createSession(options);
  site.save(initial);
  assert.deepEqual(await Promise.all([site.token(),app.token()]),['renewed-test-token','renewed-test-token']);
  assert.equal(calls,1);
  assert.equal(app.current().refreshToken,'refresh-test-token');
});
test('Signing out during refresh prevents a stale response from restoring the session', async () => {
  let resolveRefresh, started;
  const ready = new Promise(resolve => { started=resolve; });
  const session = createSession({ storage:storage(), lock:serialLock(), now:()=>100000,
    refresh:() => { started(); return new Promise(resolve => { resolveRefresh=resolve; }); } });
  session.save(initial);
  const pending=session.token(); await ready; session.clear(); resolveRefresh(refreshed);
  await assert.rejects(pending,/signed out/);
  assert.equal(session.current(),null);
  assert.equal(session.profile(),null);
});
test('Invalid refresh credentials clear the session; a transient connection failure retains it for retry', async () => {
  for (const error of [{error:'invalid_grant'},new Error('test network failure')]) {
    const session=createSession({storage:storage(),lock:serialLock(),now:()=>100000,refresh:async()=>{throw error;}});
    session.save(initial); await assert.rejects(session.token(),/could not be renewed/);
    assert.equal(Boolean(session.current()),error.error!=='invalid_grant');
  }
});
