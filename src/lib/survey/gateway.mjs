import { independentFetch } from '../network/upstream.mjs';
import { MOUNT, isSurveyAssetPath } from './paths.mjs';
export { MOUNT } from './paths.mjs';
const cookieNames = new Set(['openinfra_survey_session', 'openinfra_survey_csrf']);
const safe = new Set(['GET', 'HEAD']);
const responseHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};
// These routes share the method allowlist below. The service owns permissions
// and workflow validation; the gateway only exposes this bounded set of paths.
const participantRoutes = [
  /^\/api\/v1\/catalogue(?:\/\d+(?:\/start)?)?$/,
  /^\/api\/v1\/responses(?:\/\d+(?:\/(?:submit|(?:deployment-)?copy-(?:candidates|preview|confirm)))?)?$/,
  /^\/api\/v1\/deployments(?:\/(?:accept-invitation|\d+(?:\/(?:archive|restore|submit|invitations|revoke-invitation|remove-editor))?))?$/,
];

function failure(status, message) {
  return Response.json({ detail: message }, { status, headers: responseHeaders });
}
export function permittedPath(path, method, local = false) {
  if (/[\\%]/.test(path)) return false;
  if (
    ['/embed/manifest', '/embed/staff-manifest', '/embed/analytics-manifest'].includes(path) ||
    isSurveyAssetPath(path)
  )
    return safe.has(method);
  if (['/api/v1/analytics', '/api/v1/analytics-settings'].includes(path)) return safe.has(method);
  if (/^\/api\/v1\/analytics\/[1-9]\d*\/charts\/[a-zA-Z0-9_-]+$/.test(path))
    return safe.has(method);
  if (/^\/api\/v1\/analytics-settings\/[1-9]\d*$/.test(path)) return method === 'PUT';
  // Survey requires copy-policy approval permission; writes also require CSRF.
  if (path === '/api/v1/prefill-sources') return safe.has(method);
  if (/^\/api\/v1\/surveys\/[1-9]\d*\/prefill-preview$/.test(path)) return method === 'POST';
  if (path === '/api/v1/answer-copy-versions') return safe.has(method);
  if (path === '/api/v1/answer-copy-policies') return safe.has(method) || method === 'POST';
  if (/^\/api\/v1\/answer-copy-policies\/[1-9]\d*$/.test(path)) return safe.has(method);
  if (/^\/api\/v1\/answer-copy-policies\/[1-9]\d*\/revoke$/.test(path)) return method === 'POST';
  if (path === '/api/session') return safe.has(method);
  if (path === '/api/v1/clouds/questionnaires') return safe.has(method);
  if (path === '/api/v1/clouds') return safe.has(method) || method === 'POST';
  if (/^\/api\/v1\/clouds\/[1-9]\d*$/.test(path)) return safe.has(method) || method === 'PUT';
  if (/^\/api\/v1\/clouds\/[1-9]\d*\/annual$/.test(path))
    return safe.has(method) || method === 'POST';
  if (/^\/api\/v1\/clouds\/[1-9]\d*\/retire$/.test(path)) return method === 'POST';
  // Native-response exports are separate from the private historical archive.
  // Survey independently requires active editor permissions and CSRF for export.
  if (path === '/api/v1/reporting/versions') return safe.has(method);
  if (/^\/api\/v1\/reporting\/versions\/[1-9]\d*\/export$/.test(path)) return method === 'POST';
  if (['/auth/login', '/auth/callback', ...(local ? ['/auth/local'] : [])].includes(path))
    return safe.has(method) || (local && path === '/auth/local' && method === 'POST');
  if (/^\/api\/v1\/responses\/[1-9]\d*\/affiliation$/.test(path)) return method === 'POST';
  if (path === '/auth/logout') return method === 'POST';
  // The service enforces reviewer permissions and CSRF on these exact draft routes.
  if (path === '/api/v1/surveys') return ['GET', 'HEAD', 'POST'].includes(method);
  if (/^\/api\/v1\/surveys\/\d+$/.test(path)) return ['GET', 'HEAD', 'PUT'].includes(method);
  // Publisher authorization, revision checks and CSRF remain enforced by Survey.
  if (
    /^\/api\/v1\/surveys\/[1-9]\d*\/(?:publication-review|publish|collection|deployment-template)$/.test(
      path,
    )
  )
    return method === 'POST';
  if (!['GET', 'HEAD', 'POST', 'PUT'].includes(method)) return false;
  return participantRoutes.some((route) => route.test(path));
}
function cookies(header) {
  return (header || '')
    .split(';')
    .map((x) => x.trim())
    .filter((x) => cookieNames.has(x.split('=')[0]))
    .join('; ');
}
function cookieForMount(value) {
  if (!cookieNames.has(value.split('=')[0])) return null;
  return (
    value.replace(/;\s*Domain=[^;]*/gi, '').replace(/;\s*Path=[^;]*/gi, '') + '; Path=/user-survey/'
  );
}
export async function forwardSurvey(
  request,
  bindings,
  { fetcher = fetch, development = false } = {},
) {
  const guardedFetch = (input, options) => independentFetch(input, options, fetcher);
  const url = new URL(request.url);
  if (!url.pathname.startsWith(MOUNT + '/')) return failure(404, 'Not found');
  const path = url.pathname.slice(MOUNT.length);
  let origin;
  try {
    origin = new URL(bindings.SURVEY_SERVICE_ORIGIN);
  } catch {
    return failure(503, 'Survey is temporarily unavailable.');
  }
  const local =
    development &&
    ['127.0.0.1', 'localhost'].includes(url.hostname) &&
    ['127.0.0.1', 'localhost'].includes(origin.hostname) &&
    origin.protocol === 'http:';
  if (
    (!local && origin.origin !== 'https://survey-staging.openstack.org') ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash ||
    origin.username ||
    origin.password
  )
    return failure(503, 'Survey is temporarily unavailable.');
  if (!local && (!bindings.SURVEY_ACCESS_CLIENT_ID || !bindings.SURVEY_ACCESS_CLIENT_SECRET))
    return failure(503, 'Survey is temporarily unavailable.');
  if (!permittedPath(path, request.method, local)) return failure(404, 'Not found');
  // State-changing calls must originate at this website; Django independently
  // verifies its CSRF cookie/header and object-level permissions.
  if (!safe.has(request.method) && request.headers.get('Origin') !== url.origin)
    return failure(403, 'The request origin could not be verified.');
  if (Number(request.headers.get('Content-Length') || 0) > 300000)
    return failure(413, 'Request too large');
  const headers = new Headers();
  for (const key of ['Accept', 'Content-Type', 'Origin', 'Referer', 'X-CSRFToken']) {
    const value = request.headers.get(key);
    if (value) headers.set(key, value);
  }
  const cookie = cookies(request.headers.get('Cookie'));
  if (cookie) headers.set('Cookie', cookie);
  if (!local) {
    headers.set('CF-Access-Client-Id', bindings.SURVEY_ACCESS_CLIENT_ID);
    headers.set('CF-Access-Client-Secret', bindings.SURVEY_ACCESS_CLIENT_SECRET);
  }
  let body;
  if (!safe.has(request.method)) {
    if (request.body) {
      const reader = request.body.getReader();
      const chunks = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > 300000) {
          await reader.cancel();
          return failure(413, 'Request too large');
        }
        chunks.push(value);
      }
      body = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }
    }
  }
  let upstream;
  try {
    upstream = await guardedFetch(new URL(path + url.search, origin), {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return failure(
      502,
      'Survey is temporarily unavailable. Keep a copy of any unsaved answers before retrying.',
    );
  }
  const output = new Headers(responseHeaders);
  for (const key of ['Content-Type', 'Content-Disposition']) {
    const value = upstream.headers.get(key);
    if (value) output.set(key, value);
  }
  for (const value of upstream.headers.getSetCookie()) {
    const cookie = cookieForMount(value);
    if (cookie) output.append('Set-Cookie', cookie);
  }
  // Rejected redirects still carry legitimate session changes. Their bodies are
  // not forwarded, so release the stream even when cancellation itself fails.
  const rejectRedirect = (message) => {
    // Start cancellation without delaying the error while the network tears down.
    void upstream.body?.cancel().catch(() => {});
    const response = failure(502, message);
    for (const cookie of output.getSetCookie()) response.headers.append('Set-Cookie', cookie);
    return response;
  };
  if (upstream.status >= 300 && upstream.status < 400) {
    let target;
    try {
      target = new URL(upstream.headers.get('Location') || '/', origin);
    } catch {
      return rejectRedirect('The survey returned an unsupported destination.');
    }
    if (target.origin === origin.origin) {
      if (
        target.pathname === '/' &&
        path === '/auth/callback' &&
        target.search === '?workspace=staff'
      )
        output.set('Location', '/user-survey/staff/');
      else if (target.pathname === '/')
        output.set('Location', '/user-survey/' + target.search + target.hash);
      else if (permittedPath(target.pathname, 'GET', local))
        output.set('Location', MOUNT + target.pathname + target.search + target.hash);
      else return rejectRedirect('The survey returned an unsupported destination.');
    } else if (
      path === '/auth/login' &&
      target.origin === 'https://id.openinfra.dev' &&
      target.pathname === '/oauth2/auth'
    ) {
      output.set('Location', target.href);
    } else return rejectRedirect('Survey sign-in is temporarily unavailable.');
  }
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers: output,
  });
}
