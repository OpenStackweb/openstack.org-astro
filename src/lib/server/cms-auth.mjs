import { independentFetch } from '../network/upstream.mjs';
const origin = 'https://beta.openstack.org';
const callback = origin + '/admin/auth/callback';
const cookieName = '__Host-cms-oauth';
const repo = 'OpenStackweb/openstack.org-sveltekit';
const random = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, '0'),
  ).join('');
const headers = () =>
  new Headers({
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
const cookie = (value, age) =>
  `${cookieName}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;
const fail = (message, status = 400) => new Response(message, { status, headers: headers() });

export async function cmsAuth(request, env = {}, upstreamFetch = fetch) {
  const guardedFetch = (input, options) => independentFetch(input, options, upstreamFetch);
  const url = new URL(request.url);
  if (url.origin !== origin)
    return fail('CMS GitHub login is available only on beta.openstack.org.', 403);
  if (!env.CMS_GITHUB_CLIENT_ID || !env.CMS_GITHUB_CLIENT_SECRET)
    return fail(
      'GitHub editor login is not connected yet. An administrator must configure the beta CMS GitHub app.',
      503,
    );
  if (url.pathname.replace(/\/$/, '') === '/admin/auth') {
    const state = random(),
      verifier = random();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const authorize = new URL('https://github.com/login/oauth/authorize');
    // GitHub App permissions are defined at installation, not broad OAuth scopes.
    authorize.search = new URLSearchParams({
      client_id: env.CMS_GITHUB_CLIENT_ID,
      redirect_uri: callback,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }).toString();
    const output = headers();
    output.set('Location', authorize.href);
    output.set(
      'Set-Cookie',
      cookie(btoa(JSON.stringify({ state, verifier, created: Date.now() })), 600),
    );
    return new Response(null, { status: 302, headers: output });
  }
  let session;
  try {
    const matches = (request.headers.get('Cookie') || '')
      .split(';')
      .map((x) => x.trim())
      .filter((x) => x.startsWith(cookieName + '='));
    if (matches.length !== 1) throw Error();
    session = JSON.parse(atob(matches[0].slice(cookieName.length + 1)));
  } catch {
    return fail('This editor login has expired. Close this window and sign in again.');
  }
  const code = url.searchParams.get('code'),
    state = url.searchParams.get('state');
  if (
    !code ||
    code.length > 2048 ||
    !state ||
    state !== session.state ||
    !/^[a-f0-9]{64}$/.test(session.verifier) ||
    !Number.isFinite(session.created) ||
    Date.now() - session.created > 600000 ||
    session.created > Date.now()
  )
    return fail('This editor login could not be verified. Close this window and sign in again.');
  // Workers supports manual/follow only. Non-2xx checks below reject redirects
  // without forwarding the client secret or user token to another destination.
  let stage = 'token-request';
  try {
    const exchanged = await guardedFetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.CMS_GITHUB_CLIENT_ID,
        client_secret: env.CMS_GITHUB_CLIENT_SECRET,
        redirect_uri: callback,
        code,
        code_verifier: session.verifier,
      }),
    });
    if (!exchanged.ok) return fail('GitHub could not complete editor login.', 502);
    stage = 'token-response';
    const result = await exchanged.json();
    if (typeof result.access_token !== 'string' || !result.access_token)
      return fail('GitHub did not authorize editor access.', 403);
    stage = 'repository-request';
    const access = await guardedFetch(`https://api.github.com/repos/${repo}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${result.access_token}`,
        'User-Agent': 'OpenStack-Beta-CMS',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    stage = 'repository-response';
    if (!access.ok || !(await access.json()).permissions?.push)
      return fail(
        'Your GitHub account and the CMS app need write access to OpenStackweb/openstack.org-sveltekit.',
        403,
      );
    stage = 'editor-handoff';
    const nonce = random();
    const message = JSON.stringify(
      'authorization:github:success:' +
        JSON.stringify({ token: result.access_token, provider: 'github' }),
    ).replace(/</g, '\\u003c');
    const output = headers();
    output.set('Content-Type', 'text/html; charset=utf-8');
    output.set('Set-Cookie', cookie('', 0));
    output.set(
      'Content-Security-Policy',
      `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`,
    );
    return new Response(
      `<!doctype html><html lang="en"><meta charset="utf-8"><title>Editor sign-in</title><p>Completing editor sign-in. You can close this window when the editor opens.</p><script nonce="${nonce}">if(window.opener){const receive=event=>{if(event.origin!==${JSON.stringify(origin)}||event.source!==window.opener||event.data!=='authorizing:github')return;window.removeEventListener('message',receive);window.opener.postMessage(${message},${JSON.stringify(origin)});window.close();};window.addEventListener('message',receive);window.opener.postMessage('authorizing:github',${JSON.stringify(origin)});}</script></html>`,
      { headers: output },
    );
  } catch (error) {
    // Only fixed labels leave this handler: upstream exceptions can contain credentials.
    const kind = ['TimeoutError', 'AbortError', 'SyntaxError', 'TypeError'].includes(error?.name)
      ? error.name
      : 'Error';
    return fail(
      `Editor sign-in failed (${stage}/${kind}). Close this window and try signing in again.`,
      502,
    );
  }
}
