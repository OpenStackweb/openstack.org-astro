import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditFetchFor } from '../lib/local-audit-target.mjs';

const base = 'http://127.0.0.1:4422';
const headers = { 'X-Framework-Comparison': 'astro', 'X-Beta-Legacy-Proxy': 'disabled' };

test('unsafe origins are refused without any request', async () => {
  for (const target of [undefined, 'https://www.openstack.org', 'http://127.0.0.1',
    `${base}/path`, `${base}?token=synthetic`, `${base}#fragment`, 'http://user@127.0.0.1:4422']) {
    let calls = 0;
    await assert.rejects(auditFetchFor(target, async () => { calls++; }));
    assert.equal(calls, 0);
  }
});

test('only root HEAD is sent when target identity or status is unverified', async () => {
  for (const response of [new Response(null, { status: 302, headers }),
    new Response(null, { status: 200 }),
    new Response(null, { headers: { ...headers, 'X-Beta-Legacy-Proxy': 'enabled' } })]) {
    const calls = [];
    await assert.rejects(auditFetchFor(base, async (url, options) => {
      calls.push({ url: url.href, ...options });
      return response;
    }), /isolated Astro/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${base}/`);
    assert.equal(calls[0].method, 'HEAD');
    assert.equal(calls[0].redirect, 'manual');
  }
});

test('verified reads retain query semantics but never follow redirects', async () => {
  const calls = [];
  const fetch = await auditFetchFor(base, async (url, options) => {
    calls.push({ url: url.href, ...options });
    return calls.length === 1 ? new Response(null, { headers }) : new Response(null, {
      status: 302, headers: { Location: 'https://www.openstack.org/legacy-detail/' },
    });
  });
  const response = await fetch('/paper/?lang=fr_FR', { redirect: 'follow' });
  assert.equal(response.status, 302);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, `${base}/paper/?lang=fr_FR`);
  assert.equal(calls[1].redirect, 'manual');
  assert.ok(calls[1].signal instanceof AbortSignal);
});

test('cross-origin requests, credentials and mutations fail before route reads', async () => {
  let calls = 0;
  const fetch = await auditFetchFor(base, async () => {
    calls++;
    return new Response(null, { headers });
  });
  await assert.rejects(fetch('https://www.openstack.org/legacy-detail/'));
  await assert.rejects(fetch('http://127.0.0.1:9999/'));
  await assert.rejects(fetch('http://user@127.0.0.1:4422/'));
  await assert.rejects(fetch('/action/', { method: 'POST' }));
  assert.equal(calls, 1);
});
