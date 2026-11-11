import test from 'node:test';
import assert from 'node:assert/strict';
import { permittedPath, forwardSurvey } from '../../src/lib/survey/gateway.mjs';

test('native reporting gateway permits only metadata reads and explicit export POST', () => {
  assert.equal(permittedPath('/api/v1/reporting/versions', 'GET'), true);
  assert.equal(permittedPath('/api/v1/reporting/versions', 'POST'), false);
  assert.equal(permittedPath('/api/v1/reporting/versions/1/export', 'POST'), true);
  for (const path of [
    '/api/v1/history/export',
    '/api/v1/reporting/versions/0/export',
    '/api/v1/reporting/versions/1/answers',
    '/api/v1/reporting/versions/1/export/',
  ])
    assert.equal(permittedPath(path, 'POST'), false);
  assert.equal(permittedPath('/api/v1/reporting/versions/1/export', 'GET'), false);
});

test('export forwarding rejects cross-origin requests before credentials or bodies reach Survey', async () => {
  const env = {
    SURVEY_SERVICE_ORIGIN: 'https://survey-staging.openstack.org',
    SURVEY_ACCESS_CLIENT_ID: 'synthetic',
    SURVEY_ACCESS_CLIENT_SECRET: 'synthetic',
  };
  let called = false;
  const request = new Request(
    'https://astro.openstack.org/user-survey/service/api/v1/reporting/versions/1/export',
    { method: 'POST', headers: { Origin: 'https://other.invalid' }, body: '{}' },
  );
  const response = await forwardSurvey(request, env, {
    fetcher: () => {
      called = true;
      throw Error('must not call');
    },
  });
  assert.equal(response.status, 403);
  assert.equal(called, false);
});

test('annual reporting allows scoped reads and CSV POST but no answer changes', () => {
  for (const path of [
    '/api/v1/reporting/editions',
    '/api/v1/reporting/editions/n-30/records',
    '/api/v1/reporting/editions/a-68/records/a-123',
    '/api/v1/reporting/editions/n-30/records/n-p-1',
    '/api/v1/reporting/editions/n-30/records/n-d-2',
    '/api/v1/history/reports',
    '/api/v1/history/report-graphs/1',
    '/api/v1/history/earlier',
  ]) {
    assert.equal(permittedPath(path, 'GET'), true, path);
    for (const method of ['PUT', 'POST', 'DELETE'])
      assert.equal(permittedPath(path, method), false, path);
  }
  assert.equal(permittedPath('/api/v1/reporting/editions/n-30/export', 'POST'), true);
  assert.equal(permittedPath('/api/v1/reporting/editions/n-30/export', 'GET'), false);
  for (const path of [
    '/api/v1/reporting/editions/n-0/records',
    '/api/v1/reporting/editions/x-1/records',
    '/api/v1/reporting/editions/n-1/records/1',
    '/api/v1/history/responses/1/answers/1/review',
  ])
    assert.equal(permittedPath(path, 'GET'), false, path);
});
