import mediaRegistry from '../content/media.json' with { type: 'json' };
import { localMediaHref } from './media-assets.mjs';
import { isLegacyPath, reviewHref } from '../legacy-routes.js';
import { applyAssetCaching, assetRequestHeaders, isStaticAsset } from './proxy-assets.mjs';
import { isLegacyAuthPath, legacySessionCookie, copyLegacySession } from './legacy-session.mjs';

const ORIGIN = 'https://legacy.openstack.org';
const safeQuery = new Set([
  'start',
  'page',
  'limit',
  'sort',
  'category',
  'search',
  'q',
  'locale',
  'saved',
  'term',
]);
const speakerQuery = new Set([
  'letter',
  'search_query',
  'spoken_language[]',
  'country_origin[]',
  'city',
  'zipcode',
  'travel_preference[]',
]);
const speakerPage = (path) => /^\/community\/speakers(?:\/results)?\/?$/.test(path);
const headers = () =>
  new Headers({
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://ajax.googleapis.com https://code.jquery.com https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; connect-src 'self'; form-action 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  });
const fail = (message, status) => new Response(message, { status, headers: headers() });

function safeBackURL(value) {
  if (!value || value.length > 8192 || /[\s\\]/.test(value)) return '/';
  // SilverStripe embeds an absolute BackURL in its OAuth callback. Preserve
  // that value: changing it changes redirect_uri during the code exchange.
  if (!value.startsWith('/') && !value.startsWith('https://beta.openstack.org/')) return '/';
  if (value.startsWith('//')) return '/';
  try {
    const destination = new URL(value, 'https://beta.openstack.org');
    if (
      destination.origin !== 'https://beta.openstack.org' ||
      destination.username ||
      destination.password
    )
      return '/';
    if (
      destination.pathname !== '/' &&
      destination.pathname !== '/auth/login' &&
      !isLegacyPath(destination.pathname)
    )
      return '/';
    if (/^\/profile\/EditProfileForm\/?$/.test(destination.pathname)) return '/';
    return value;
  } catch {
    return '/';
  }
}

export function rewriteLegacyHTML(
  response,
  requestURL,
  Rewriter = globalThis.HTMLRewriter,
  authEnabled = false,
  mediaEnabled = false
) {
  if (!Rewriter) return fail('Legacy HTML rewriting requires the Cloudflare runtime.', 503);
  let baseURL = requestURL;
  const profilePage =
    authEnabled && /^\/profile(?:\/EditProfileForm)?\/?$/.test(new URL(requestURL).pathname);
  const speakerSearch = speakerPage(new URL(requestURL).pathname);
  const rewriteURL = (value) => {
    if (mediaEnabled) {
      const media = localMediaHref(value, mediaRegistry);
      if (media) return media;
    }
    try {
      const url = new URL(value, value.startsWith('#') ? requestURL : baseURL);
      if (!['http:', 'https:'].includes(url.protocol)) return value;
      if (
        [
          'legacy.openstack.org',
          'www.openstack.org',
          'openstack.org',
          'beta.openstack.org',
        ].includes(url.hostname)
      ) {
        if (authEnabled && url.pathname.replace(/\/$/, '') === '/Security/login')
          return (
            '/auth/login?' +
            new URLSearchParams({ back: safeBackURL(url.searchParams.get('BackURL')) })
          );
        if (authEnabled && url.pathname.replace(/\/$/, '') === '/Security/logout')
          return '/auth/signout';
        if (authEnabled && isLegacyAuthPath(url.pathname)) return url.pathname + url.search;
        const rewritten = reviewHref(url.href);
        // Links to sections not in this POC use the public front door, not the private origin.
        return rewritten.startsWith('/')
          ? rewritten
          : `https://www.openstack.org${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      /* Preserve malformed upstream attributes without failing the page. */
    }
    return value;
  };
  return new Rewriter()
    .on('base', {
      element(e) {
        try {
          const base = new URL(e.getAttribute('href') || '/', requestURL);
          if (
            !['https:', 'http:'].includes(base.protocol) ||
            ![
              'legacy.openstack.org',
              'www.openstack.org',
              'openstack.org',
              'beta.openstack.org',
            ].includes(base.hostname)
          ) {
            e.remove();
            return;
          }
          baseURL = base.href;
          e.setAttribute('href', base.pathname + base.search);
        } catch {
          e.remove();
        }
      },
    })
    .on('meta[http-equiv="refresh"]', { element: (e) => e.remove() })
    .on('[href], [src], [poster]', {
      element(e) {
        for (const key of ['href', 'src', 'poster']) {
          const value = e.getAttribute(key);
          if (value) e.setAttribute(key, rewriteURL(value));
        }
      },
    })
    .on('form', {
      element(e) {
        if (
          speakerSearch &&
          e.getAttribute('id') === 'search_form' &&
          (e.getAttribute('method') || '').toLowerCase() === 'get'
        ) {
          e.setAttribute('action', '/community/speakers/results');
          return;
        }
        if (profilePage && e.getAttribute('id') === 'EditProfileForm_EditProfileForm') {
          e.setAttribute('action', '/profile/EditProfileForm');
          e.setAttribute('method', 'post');
          e.setAttribute('enctype', 'application/x-www-form-urlencoded');
          return;
        }
        e.removeAttribute('action');
        e.setAttribute('inert', '');
        e.prepend('Form submissions are disabled in this review preview.');
      },
    })
    .on('form input, form button, form select, form textarea', {
      element: (e) => {
        if (!profilePage && !speakerSearch) e.setAttribute('disabled', '');
      },
    })
    .on('body', {
      element(e) {
        e.prepend(
          `<aside style="padding:10px;background:#233746;color:white;text-align:center">${profilePage ? 'Beta profile · Changes save to your existing account.' : speakerSearch ? 'Beta Speakers Bureau · Search and browsing available.' : 'Legacy page preview · Forms disabled · Some links open the existing site.'} <a href="/" style="color:white">Beta home</a></aside>`,
          { html: true }
        );
      },
    })
    .transform(response);
}

export async function proxyLegacy(
  request,
  env = {},
  upstreamFetch = fetch,
  rewrite = rewriteLegacyHTML
) {
  const url = new URL(request.url);
  const authEnabled = env.LEGACY_AUTH_ENABLED === 'true' && url.hostname === 'beta.openstack.org';
  const authRoute = authEnabled && isLegacyAuthPath(url.pathname);
  if (!isLegacyPath(url.pathname) && !authRoute)
    return fail('This legacy route is not enabled in the review preview.', 404);
  const profileSave =
    authEnabled &&
    /^\/profile\/EditProfileForm\/?$/.test(url.pathname) &&
    request.method === 'POST';
  if (!['GET', 'HEAD'].includes(request.method) && !profileSave)
    return fail('This action is not enabled.', 405);
  let formBody;
  if (profileSave) {
    if (
      request.headers.get('Origin') !== 'https://beta.openstack.org' ||
      !legacySessionCookie(request)
    )
      return fail('A beta session and same-origin request are required.', 403);
    if (
      !/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get('Content-Type') || '')
    )
      return fail('Unsupported profile submission format.', 415);
    formBody = await request.text();
    if (formBody.length > 65536) return fail('Profile submission is too large.', 413);
    const values = new URLSearchParams(formBody);
    if (
      !values.get('SecurityID') ||
      !values.has('action_SaveProfile') ||
      [...values.keys()].some((k) => k.startsWith('action_') && k !== 'action_SaveProfile')
    )
      return fail('Invalid profile submission.', 400);
  }
  if (
    env.REDIRECTION_RULE_HOST !== ORIGIN ||
    env.REDIRECTION_RULE_HEADER_X_FORWARDED_HOST !== 'www.openstack.org' ||
    !env.REDIRECTION_RULE_HEADER_AUTH_TOKEN
  )
    return fail('Legacy preview is not configured.', 503);
  const target = new URL(url.pathname, ORIGIN);
  for (const [key, value] of url.searchParams)
    if (
      (safeQuery.has(key) || (speakerPage(url.pathname) && speakerQuery.has(key))) &&
      value.length <= 300
    )
      target.searchParams.append(key, value);
  if (authRoute) {
    target.search = '';
    if (url.pathname.replace(/\/$/, '') === '/OpenStackIdAuthenticator') {
      for (const key of ['code', 'state', 'error', 'error_description', 'session_state']) {
        const value = url.searchParams.get(key);
        if (value && value.length <= 8192) target.searchParams.set(key, value);
      }
      target.searchParams.set('url', '/OpenStackIdAuthenticator');
    }
    // Fix the return destination: no caller-controlled off-site or write routes.
    if (url.pathname !== '/oidc/session/whoami') {
      target.searchParams.set('BackURL', safeBackURL(url.searchParams.get('BackURL')));
    }
  }
  if (isStaticAsset(url.pathname))
    for (const key of ['m', 'v']) {
      const value = url.searchParams.get(key);
      if (value && /^[A-Za-z0-9._-]{1,80}$/.test(value)) target.searchParams.set(key, value);
    }
  let upstream;
  const session = authEnabled && !isStaticAsset(url.pathname) ? legacySessionCookie(request) : null;
  const start = performance.now();
  try {
    upstream = await upstreamFetch(target, {
      method: request.method,
      redirect: 'manual',
      credentials: 'omit',
      signal: AbortSignal.timeout(15000),
      ...(profileSave ? { body: formBody } : {}),
      headers: {
        ...assetRequestHeaders(request),
        ...(profileSave
          ? {
              'Content-Type': 'application/x-www-form-urlencoded',
              Origin: 'https://beta.openstack.org',
            }
          : {}),
        ...(session ? { Cookie: session } : {}),
        Authorization: `Basic ${env.REDIRECTION_RULE_HEADER_AUTH_TOKEN}`,
        'X-Forwarded-Host': authEnabled ? 'beta.openstack.org' : 'www.openstack.org',
        'X-From': 'cloudflare-beta',
      },
    });
  } catch {
    return fail('The legacy site is unavailable. Please try again later.', 502);
  }
  const output = headers();
  if (
    speakerPage(url.pathname) ||
    (authEnabled && /^\/profile(?:\/EditProfileForm)?\/?$/.test(url.pathname))
  )
    output.set(
      'Content-Security-Policy',
      output.get('Content-Security-Policy').replace("form-action 'none'", "form-action 'self'")
    );
  // The public-cloud directory loads Google Maps directly in the browser.
  // Keep these destinations scoped to that feature, not auth/profile pages.
  if (/^\/marketplace\/public-clouds(?:\/|$)/.test(url.pathname)) {
    output.set(
      'Content-Security-Policy',
      output
        .get('Content-Security-Policy')
        .replace(
          "script-src 'self'",
          "script-src https://maps.googleapis.com https://maps.gstatic.com 'self'"
        )
        .replace(
          "connect-src 'self'",
          "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com"
        )
        .replace("worker-src 'none'", 'worker-src blob:')
    );
    // Let Google's website restrictions see the real beta origin, without paths.
    output.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  output.set('Server-Timing', `upstream;dur=${(performance.now() - start).toFixed(1)}`);
  output.set('X-Beta-Route', 'legacy');
  applyAssetCaching(request, upstream, output);
  if (authEnabled && !isStaticAsset(url.pathname)) copyLegacySession(upstream, output);
  if (upstream.status >= 300 && upstream.status < 400 && upstream.status !== 304) {
    const location = upstream.headers.get('Location');
    if (!location) return fail('Invalid legacy redirect.', 502);
    let next;
    try {
      next = new URL(location, target);
    } catch {
      return fail('Invalid legacy redirect.', 502);
    }
    if (!['http:', 'https:'].includes(next.protocol))
      return fail('Unsupported legacy redirect.', 502);
    if (
      ['legacy.openstack.org', 'www.openstack.org', 'openstack.org', 'beta.openstack.org'].includes(
        next.hostname
      )
    ) {
      if (
        !isLegacyPath(next.pathname) &&
        next.pathname !== '/' &&
        !next.pathname.startsWith('/software/') &&
        !(authEnabled && (isLegacyAuthPath(next.pathname) || next.pathname === '/auth/login'))
      ) {
        // Keep the session even if the destination is not yet supported. Record
        // only the path, never OAuth codes, state or other redirect parameters.
        output.set('X-Beta-Blocked-Path', next.pathname);
        return new Response('This destination is outside the legacy preview.', {
          status: 403,
          headers: output,
        });
      }
      if (next.pathname === url.pathname && next.search === target.search)
        return fail('Legacy origin returned a redirect loop.', 502);
      output.set('Location', next.pathname + next.search + next.hash);
    } else {
      if (authRoute && next.origin !== 'https://id.openinfra.dev')
        return fail('Unexpected identity provider redirect.', 502);
      output.set('Location', next.href);
    }
    return new Response(null, { status: upstream.status, headers: output });
  }
  if ([401, 403].includes(upstream.status))
    return fail('The legacy origin did not authorize this preview request.', 502);
  const type =
    url.pathname.startsWith('/userprofile/') && upstream.status === 200
      ? 'application/json'
      : upstream.headers.get('Content-Type') || 'application/octet-stream';
  output.set('Content-Type', type);
  // Only the explicit legacy session cookie is relayed when beta auth is enabled.
  const response = new Response(
    request.method === 'HEAD' || [204, 205, 304].includes(upstream.status) ? null : upstream.body,
    { status: upstream.status, headers: output }
  );
  return request.method !== 'HEAD' && type.includes('text/html')
    ? rewrite(response, target.href, globalThis.HTMLRewriter, authEnabled, Boolean(env?.MEDIA))
    : response;
}
