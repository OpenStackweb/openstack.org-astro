import test from 'node:test';
import assert from 'node:assert/strict';
import { permittedPath } from '../../src/lib/survey/gateway.mjs';
test('affiliation retry is a POST-only owner-scoped survey action', () => {
  assert.equal(permittedPath('/api/v1/responses/3/affiliation', 'POST'), true);
  for (const method of ['GET', 'HEAD', 'PUT', 'DELETE'])
    assert.equal(permittedPath('/api/v1/responses/3/affiliation', method), false);
  for (const path of [
    '/api/v1/responses/0/affiliation',
    '/api/v1/responses/3/affiliation/4',
    '/api/v1/members/3/affiliations',
  ])
    assert.equal(permittedPath(path, 'POST'), false);
});
