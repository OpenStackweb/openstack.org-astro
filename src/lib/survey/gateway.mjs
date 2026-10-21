import { independentFetch } from '../network/upstream.mjs';
export const MOUNT = '/user-survey/service';
const cookieNames = new Set(['openinfra_survey_session', 'openinfra_survey_csrf']);
const safe = new Set(['GET', 'HEAD']);
function failure(status, message) {
  return Response.json({ detail: message }, { status, headers: {'Cache-Control':'private, no-store'} });
}
export function permittedPath(path, method, local = false) {
  if (/[\\%]|\/\//.test(path)) return false;
  if (['/embed/manifest', '/embed/staff-manifest'].includes(path) || /^\/static\/[a-zA-Z0-9_./-]+$/.test(path))
    return safe.has(method) && !path.split('/').some(p => p === '.' || p === '..');
  if (path === '/api/session') return safe.has(method);
  if (['/auth/login', '/auth/callback', ...(local ? ['/auth/local'] : [])].includes(path))
    return safe.has(method) || (local && path === '/auth/local' && method === 'POST');
  if (path === '/auth/logout') return method === 'POST';
  // The service enforces reviewer permissions and CSRF on these exact draft routes.
  if (path === '/api/v1/surveys') return ['GET', 'HEAD', 'POST'].includes(method);
  if (/^\/api\/v1\/surveys\/\d+$/.test(path)) return ['GET', 'HEAD', 'PUT'].includes(method);
  if (!['GET','HEAD','POST','PUT'].includes(method)) return false;
  return /^\/api\/v1\/(?:catalogue(?:\/\d+(?:\/start)?)?|responses(?:\/\d+(?:\/(?:submit|(?:deployment-)?copy-(?:candidates|preview|confirm)))?)?|deployments(?:\/(?:accept-invitation|\d+(?:\/(?:archive|restore|submit|invitations|revoke-invitation|remove-editor))?))?)$/.test(path);
}
function cookies(header) {
  return (header || '').split(';').map(x => x.trim()).filter(x => cookieNames.has(x.split('=')[0])).join('; ');
}
function cookieForMount(value) {
  if (!cookieNames.has(value.split('=')[0])) return null;
  return value.replace(/;\s*Domain=[^;]*/ig, '').replace(/;\s*Path=[^;]*/ig, '') + '; Path=/user-survey/';
}
export async function forwardSurvey(request, bindings, {fetcher = fetch, development = false} = {}) {
  const guardedFetch = (input, options) => independentFetch(input, options, fetcher);
  const url = new URL(request.url);
  if (!url.pathname.startsWith(MOUNT + '/')) return failure(404, 'Not found');
  const path = url.pathname.slice(MOUNT.length);
  let origin;
  try { origin = new URL(bindings.SURVEY_SERVICE_ORIGIN); } catch { return failure(503, 'Survey is temporarily unavailable.'); }
  const local = development && ['127.0.0.1','localhost'].includes(url.hostname) &&
    ['127.0.0.1','localhost'].includes(origin.hostname) && origin.protocol === 'http:';
  if ((!local && origin.origin !== 'https://survey-staging.openstack.org') || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password)
    return failure(503, 'Survey is temporarily unavailable.');
  if (!local && (!bindings.SURVEY_ACCESS_CLIENT_ID || !bindings.SURVEY_ACCESS_CLIENT_SECRET))
    return failure(503, 'Survey is temporarily unavailable.');
  if (!permittedPath(path, request.method, local)) return failure(404, 'Not found');
  // State-changing calls must originate at this website; Django independently
  // verifies its CSRF cookie/header and object-level permissions.
  if (!safe.has(request.method) && request.headers.get('Origin') !== url.origin)
    return failure(403, 'The request origin could not be verified.');
  if (Number(request.headers.get('Content-Length') || 0) > 300000) return failure(413, 'Request too large');
  const headers = new Headers();
  for (const key of ['Accept','Content-Type','Origin','Referer','X-CSRFToken']) {
    const value = request.headers.get(key); if (value) headers.set(key,value);
  }
  const cookie = cookies(request.headers.get('Cookie')); if (cookie) headers.set('Cookie',cookie);
  if (!local) {
    headers.set('CF-Access-Client-Id',bindings.SURVEY_ACCESS_CLIENT_ID);
    headers.set('CF-Access-Client-Secret',bindings.SURVEY_ACCESS_CLIENT_SECRET);
  }
  let body;
  if (!safe.has(request.method)) {
    if (request.body) {
      const reader = request.body.getReader(); const chunks = []; let total = 0;
      while (true) {
        const {done,value} = await reader.read(); if (done) break;
        total += value.byteLength;
        if (total > 300000) { await reader.cancel(); return failure(413, 'Request too large'); }
        chunks.push(value);
      }
      body = new Uint8Array(total); let offset = 0;
      for (const chunk of chunks) { body.set(chunk,offset); offset += chunk.byteLength; }
    }
  }
  let upstream;
  try { upstream = await guardedFetch(new URL(path + url.search,origin), {
    method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000),
  }); } catch { return failure(502, 'Survey is temporarily unavailable. Keep a copy of any unsaved answers before retrying.'); }
  const output = new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
  for (const key of ['Content-Type','Content-Disposition']) {
    const value = upstream.headers.get(key); if (value) output.set(key,value);
  }
  if (upstream.status >= 300 && upstream.status < 400) {
    const target = new URL(upstream.headers.get('Location') || '/',origin);
    if (target.origin === origin.origin) {
      if (target.pathname === '/') output.set('Location','/user-survey/' + target.search + target.hash);
      else if (permittedPath(target.pathname,'GET',local)) output.set('Location',MOUNT+target.pathname+target.search+target.hash);
      else return failure(502,'The survey returned an unsupported destination.');
    } else if (path === '/auth/login' && target.origin === 'https://id.openinfra.dev' && target.pathname === '/oauth2/auth') {
      output.set('Location',target.href);
    } else return failure(502,'Survey sign-in is temporarily unavailable.');
  }
  for (const value of upstream.headers.getSetCookie()) {
    const cookie = cookieForMount(value); if (cookie) output.append('Set-Cookie',cookie);
  }
  return new Response(request.method === 'HEAD' ? null : upstream.body,{status:upstream.status,headers:output});
}
