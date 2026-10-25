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
    '/api/v1/surveys/1/publish',
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
