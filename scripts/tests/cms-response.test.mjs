import test from 'node:test';
import assert from 'node:assert/strict';
import { cmsResponse } from '../../tina/cms-response.mjs';

test('CMS HTML login and error responses give recovery guidance without leaking HTML', async () => {
  for (const status of [200, 403, 502]) {
    await assert.rejects(
      cmsResponse(
        new Response('<html>private error details</html>', {
          status,
          headers: { 'content-type': 'text/html' },
        }),
        'Failed',
      ),
      (error) =>
        error.message.includes('sign in if prompted') && !error.message.includes('private'),
    );
  }
});
test('CMS JSON success, authorization failure and malformed data are distinguished', async () => {
  assert.deepEqual(await cmsResponse(Response.json({ items: [] }), 'Failed'), { items: [] });
  await assert.rejects(
    cmsResponse(Response.json({ error: 'denied' }, { status: 401 }), 'Failed'),
    /not authorized/,
  );
  await assert.rejects(
    cmsResponse(Response.json({ error: 'File too large' }, { status: 413 }), 'Failed'),
    /File too large/,
  );
  await assert.rejects(
    cmsResponse(new Response('{', { headers: { 'content-type': 'application/json' } }), 'Failed'),
    /unreadable response/,
  );
});
