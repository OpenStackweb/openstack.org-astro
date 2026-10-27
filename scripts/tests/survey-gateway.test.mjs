import test from 'node:test';
import assert from 'node:assert/strict';
import { forwardSurvey, MOUNT, permittedPath } from '../../src/lib/survey/gateway.mjs';
const env = {
  SURVEY_SERVICE_ORIGIN: 'https://survey-staging.openstack.org',
  SURVEY_ACCESS_CLIENT_ID: 'synthetic-id',
  SURVEY_ACCESS_CLIENT_SECRET: 'synthetic-secret',
};
const request = (path, options = {}) =>
  new Request('https://astro.openstack.org' + MOUNT + path, options);
test('gateway denies unsafe methods, history, traversal, arbitrary origins and missing service credentials', async () => {
  let called = false;
  const fetcher = () => {
    called = true;
    throw Error('must not fetch');
  };
  for (const path of [
    '/admin/',
    '/api/v1/history/responses',
    '/api/v1/surveys/1/publish',
    '/api/v1/surveys/1/collection',
    '/static/%2e%2e/private',
    '/static/a/../..%2fprivate',
    '/auth/local',
  ]) {
    assert.equal((await forwardSurvey(request(path), env, { fetcher })).status, 404, path);
  }
  assert.equal(
    (
      await forwardSurvey(
        request('/api/session'),
        { ...env, SURVEY_SERVICE_ORIGIN: 'https://evil.example' },
        { fetcher },
      )
    ).status,
    503,
  );
  assert.equal(
    (
      await forwardSurvey(
        request('/api/session'),
        { SURVEY_SERVICE_ORIGIN: env.SURVEY_SERVICE_ORIGIN },
        { fetcher },
      )
    ).status,
    503,
  );
  assert.equal(called, false);
});
test('gateway forwards only Survey credentials and narrows returned cookie paths', async () => {
  const result = await forwardSurvey(
    request('/api/session', {
      headers: {
        Cookie: 'CF_Authorization=outer; openinfra_survey_session=own; other=private',
        Authorization: 'Bearer unrelated',
        'CF-Access-Client-Secret': 'spoof',
      },
    }),
    env,
    {
      fetcher: async (url, options) => {
        assert.equal(url.href, 'https://survey-staging.openstack.org/api/session');
        assert.equal(options.headers.get('Cookie'), 'openinfra_survey_session=own');
        assert.equal(options.headers.get('Authorization'), null);
        assert.equal(options.headers.get('CF-Access-Client-Secret'), 'synthetic-secret');
        const headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Set-Cookie', 'openinfra_survey_csrf=value; Path=/; Secure; SameSite=Lax');
        headers.append('Set-Cookie', 'CF_Authorization=not-for-browser; Path=/');
        return new Response('{}', { headers });
      },
    },
  );
  assert.match(result.headers.get('Cache-Control'), /no-store/);
  assert.deepEqual(result.headers.getSetCookie(), [
    'openinfra_survey_csrf=value; Secure; SameSite=Lax; Path=/user-survey/',
  ]);
});
test('writes require same-origin header and retain CSRF token and revision body', async () => {
  for (const Origin of [null, 'https://other.openstack.org']) {
    const headers = Origin ? { Origin } : {};
    assert.equal(
      (
        await forwardSurvey(
          request('/api/v1/responses/1', { method: 'PUT', headers, body: '{}' }),
          env,
        )
      ).status,
      403,
    );
  }
  const response = await forwardSurvey(
    request('/api/v1/responses/1', {
      method: 'PUT',
      headers: {
        Origin: 'https://astro.openstack.org',
        'Content-Type': 'application/json',
        'X-CSRFToken': 'synthetic',
      },
      body: '{"revision":4}',
    }),
    env,
    {
      fetcher: async (url, options) => {
        assert.equal(options.headers.get('Origin'), 'https://astro.openstack.org');
        assert.equal(options.headers.get('X-CSRFToken'), 'synthetic');
        assert.equal(new TextDecoder().decode(options.body), '{"revision":4}');
        return Response.json({ revision: 5 });
      },
    },
  );
  assert.equal(response.status, 200);
});
test('unexpected auth redirects fail closed, callback redirects to survey and outages are generic', async () => {
  const redirect = (location) => async () =>
    new Response(null, { status: 302, headers: { Location: location } });
  const r = await forwardSurvey(request('/auth/callback?code=synthetic'), env, {
    fetcher: redirect('/'),
  });
  assert.equal(r.headers.get('Location'), '/user-survey/');
  const auth = await forwardSurvey(request('/auth/login'), env, {
    fetcher: redirect('https://id.openinfra.dev/oauth2/auth?state=synthetic'),
  });
  assert.match(auth.headers.get('Location'), /^https:\/\/id.openinfra.dev/);
  assert.equal(
    (
      await forwardSurvey(request('/api/session'), env, {
        fetcher: redirect('https://evil.example/'),
      })
    ).status,
    502,
  );
  assert.equal(
    (
      await forwardSurvey(request('/api/session'), env, {
        fetcher: async () => {
          throw Error('private details');
        },
      })
    ).status,
    502,
  );
});

test('oversized bodies are rejected before reaching the service', async () => {
  let called = false;
  const result = await forwardSurvey(
    request('/api/v1/responses/1', {
      method: 'PUT',
      headers: { Origin: 'https://astro.openstack.org' },
      body: 'x'.repeat(300001),
    }),
    env,
    {
      fetcher: async () => {
        called = true;
      },
    },
  );
  assert.equal(result.status, 413);
  assert.equal(called, false);
});

test('review routes preserve service authorization and CSRF boundaries', async () => {
  for (const path of ['/embed/staff-manifest', '/api/v1/surveys', '/api/v1/surveys/12']) {
    const response = await forwardSurvey(request(path), env, {
      fetcher: async () =>
        new Response('{"detail":"Review access required"}', {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
    });
    assert.equal(response.status, 403);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
  }
  let called = false;
  const response = await forwardSurvey(
    request('/api/v1/surveys/12', {
      method: 'PUT',
      headers: { Origin: 'https://astro.openstack.org', 'X-CSRFToken': 'synthetic-csrf' },
      body: '{"revision":1}',
    }),
    env,
    {
      fetcher: async (url, options) => {
        called = true;
        assert.equal(options.method, 'PUT');
        assert.equal(options.headers.get('Origin'), 'https://astro.openstack.org');
        assert.equal(options.headers.get('X-CSRFToken'), 'synthetic-csrf');
        return new Response('{}');
      },
    },
  );
  assert.equal(response.status, 200);
  assert.equal(called, true);
  for (const [path, method] of [
    ['/api/v1/surveys/12', 'DELETE'],
    ['/api/v1/history/export', 'POST'],
  ]) {
    assert.equal(
      (
        await forwardSurvey(request(path, { method }), env, {
          fetcher: () => {
            throw Error('Forbidden route reached origin');
          },
        })
      ).status,
      404,
    );
  }
});

test('malformed upstream redirect returns a controlled gateway error', async () => {
  const result = await forwardSurvey(request('/auth/login'), env, {
    fetcher: async () =>
      new Response(null, {
        status: 302,
        headers: { Location: 'https://[' },
      }),
  });
  assert.equal(result.status, 502);
  assert.equal(result.headers.get('Location'), null);
  assert.match(result.headers.get('Cache-Control'), /no-store/);
});

test('participant route groups allow supported workflows and reject lookalike paths', async () => {
  for (const path of [
    '/api/v1/catalogue',
    '/api/v1/catalogue/12',
    '/api/v1/catalogue/12/start',
    '/api/v1/responses',
    '/api/v1/responses/12',
    '/api/v1/responses/12/submit',
    ...['copy', 'deployment-copy'].flatMap((prefix) =>
      ['candidates', 'preview', 'confirm'].map(
        (action) => `/api/v1/responses/12/${prefix}-${action}`,
      ),
    ),
    '/api/v1/deployments',
    '/api/v1/deployments/12',
    '/api/v1/deployments/accept-invitation',
    ...['archive', 'restore', 'submit', 'invitations', 'revoke-invitation', 'remove-editor'].map(
      (action) => `/api/v1/deployments/12/${action}`,
    ),
  ]) {
    for (const method of ['GET', 'HEAD', 'POST', 'PUT'])
      assert.equal(permittedPath(path, method), true, `${method} ${path}`);
    for (const method of ['DELETE', 'PATCH', 'OPTIONS'])
      assert.equal(permittedPath(path, method), false, `${method} ${path}`);
    for (const invalid of [path + '/', path + '/extra', path.replace('/api/v1/', '/api/v2/')])
      assert.equal(permittedPath(invalid, 'GET'), false, invalid);
  }
  for (const path of [
    '/api/v1/catalogue/start',
    '/api/v1/responses/12/archive',
    '/api/v1/deployments/12/copy-confirm',
    '/api/v1/deployments/accept-invitation/12',
    '/api/v1/responses/-1',
    '/api/v1/catalogue/a',
  ]) {
    assert.equal(permittedPath(path, 'GET'), false, path);
  }
});

test('rejected redirects retain only Survey cookies and cancel discarded upstream bodies', async () => {
  for (const location of ['https://[', '/admin/', 'https://other.example/']) {
    for (const cancellationFails of [false, true]) {
      let cancelled = false;
      const body = new ReadableStream({
        cancel() {
          cancelled = true;
          if (cancellationFails) throw Error('synthetic stream failure');
        },
      });
      const headers = new Headers({
        Location: location,
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename=upstream.html',
      });
      headers.append(
        'Set-Cookie',
        'openinfra_survey_session=; Max-Age=0; Domain=survey-staging.openstack.org; Path=/; Secure',
      );
      headers.append('Set-Cookie', 'openinfra_survey_csrf=rotated; Path=/; Secure');
      headers.append('Set-Cookie', 'CF_Authorization=private; Path=/');
      const response = await forwardSurvey(request('/auth/login'), env, {
        fetcher: async () => new Response(body, { status: 302, headers }),
      });
      assert.equal(response.status, 502);
      assert.equal(cancelled, true);
      assert.equal(response.headers.get('Location'), null);
      assert.equal(response.headers.get('Content-Disposition'), null);
      assert.match(response.headers.get('Content-Type'), /application\/json/);
      assert.match(response.headers.get('Cache-Control'), /no-store/);
      assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
      assert.deepEqual(response.headers.getSetCookie(), [
        'openinfra_survey_session=; Max-Age=0; Secure; Path=/user-survey/',
        'openinfra_survey_csrf=rotated; Secure; Path=/user-survey/',
      ]);
      assert.ok((await response.json()).detail);
    }
  }
});

test('a rejected redirect returns before slow body cancellation completes', async () => {
  let finishCancellation;
  let cancellationStarted = false;
  const body = new ReadableStream({
    cancel() {
      cancellationStarted = true;
      return new Promise((resolve) => {
        finishCancellation = resolve;
      });
    },
  });
  let timer;
  try {
    const response = await Promise.race([
      forwardSurvey(request('/auth/login'), env, {
        fetcher: async () =>
          new Response(body, { status: 302, headers: { Location: 'https://[' } }),
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Error('502 waited for cancellation')), 500);
      }),
    ]);
    assert.equal(response.status, 502);
    assert.equal(cancellationStarted, true);
  } finally {
    clearTimeout(timer);
    finishCancellation?.();
  }
});

test('publication actions expose only exact POST routes', () => {
  for (const action of ['publication-review', 'publish', 'collection', 'deployment-template']) {
    const path = `/api/v1/surveys/3/${action}`;
    assert.equal(permittedPath(path, 'POST'), true);
    for (const method of ['GET', 'HEAD', 'PUT', 'DELETE'])
      assert.equal(permittedPath(path, method), false);
    assert.equal(permittedPath(path + '/extra', 'POST'), false);
  }
  assert.equal(permittedPath('/api/v1/surveys/0/publish', 'POST'), false);
});

test('publishing preserves backend denial and requires same-origin writes', async () => {
  for (const action of ['publication-review', 'publish', 'collection', 'deployment-template']) {
    const path = `/api/v1/surveys/3/${action}`;
    let called = false;
    const fetcher = async (_url, options) => {
      called = true;
      assert.equal(options.headers.get('X-CSRFToken'), 'synthetic');
      return Response.json({ detail: 'Publisher permission required' }, { status: 403 });
    };
    assert.equal(
      (await forwardSurvey(request(path, { method: 'POST' }), env, { fetcher })).status,
      403,
    );
    assert.equal(called, false);
    const result = await forwardSurvey(
      request(path, {
        method: 'POST',
        headers: { Origin: 'https://astro.openstack.org', 'X-CSRFToken': 'synthetic' },
        body: '{"revision":1}',
      }),
      env,
      { fetcher },
    );
    assert.equal(called, true);
    assert.equal(result.status, 403);
    assert.match(await result.text(), /Publisher permission/);
  }
});

test('persistent cloud gateway exposes only the bounded profile actions', () => {
  for (const [path, method] of [
    ['/api/v1/clouds', 'GET'],
    ['/api/v1/clouds', 'POST'],
    ['/api/v1/clouds/questionnaires', 'GET'],
    ['/api/v1/clouds/1', 'PUT'],
    ['/api/v1/clouds/1/annual', 'GET'],
    ['/api/v1/clouds/1/annual', 'POST'],
    ['/api/v1/clouds/1/retire', 'POST'],
  ])
    assert.equal(permittedPath(path, method), true);
  for (const [path, method] of [
    ['/api/v1/clouds/1', 'DELETE'],
    ['/api/v1/clouds/questionnaires', 'POST'],
    ['/api/v1/clouds/1/retire', 'GET'],
    ['/api/v1/clouds/1/owner', 'PUT'],
    ['/api/v1/clouds/0/annual', 'POST'],
    ['/api/v1/clouds/1/annual/extra', 'POST'],
  ])
    assert.equal(permittedPath(path, method), false);
});

test('analytics exposes only bounded aggregate reads and revision-checked settings writes', () => {
  for (const path of [
    '/embed/analytics-manifest',
    '/api/v1/analytics',
    '/api/v1/analytics/1/charts/a123',
    '/api/v1/analytics-settings',
  ]) {
    assert.equal(permittedPath(path, 'GET'), true);
    assert.equal(permittedPath(path, 'POST'), false);
  }
  assert.equal(permittedPath('/api/v1/analytics-settings/1', 'PUT'), true);
  assert.equal(permittedPath('/api/v1/analytics-settings/1', 'DELETE'), false);
  assert.equal(permittedPath('/api/v1/analytics/1/answers', 'GET'), false);
  assert.equal(permittedPath('/api/v1/analytics/1/charts/a%2fb', 'GET'), false);
});
