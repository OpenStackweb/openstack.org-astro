import test from 'node:test';
import assert from 'node:assert/strict';
import { readAuditHtml } from '../lib/audit-html-response.mjs';

const html = '<!doctype html><html><head><title>Archive</title></head><body><main>Content</main></body></html>';
const response = (body = html, status = 200, type = 'text/html; charset=utf-8') =>
  new Response(body, { status, headers: { 'content-type': type } });

test('redirects and server errors are failed inspections, even with HTML bodies', async () => {
  for (const status of [302, 404, 500]) {
    assert.equal((await readAuditHtml(response(html, status))).failure, 'not-rendered-200');
  }
});

test('successful non-HTML responses do not count as inspected pages', async () => {
  for (const type of ['application/json', 'application/pdf', 'text/plain', '']) {
    assert.equal((await readAuditHtml(response(html, 200, type))).failure, 'not-html');
  }
});

test('empty and fragment-only success responses are incomplete documents', async () => {
  for (const body of ['', '<h1>Temporarily unavailable</h1>', '<html><head></head></html>']) {
    assert.equal((await readAuditHtml(response(body))).failure, 'incomplete-html-document');
  }
});

test('complete HTML remains inspectable even when editorial metadata is missing', async () => {
  const result = await readAuditHtml(response());
  assert.equal(result.failure, undefined);
  assert.ok(result.elements.some(element => element.name === 'title'));
  assert.ok(!result.elements.some(element => element.name === 'meta'));
});
