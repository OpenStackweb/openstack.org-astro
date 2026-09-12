export const isLegacyAuthPath = (path) =>
  [
    '/Security/login',
    '/Security/logout',
    '/Security/error',
    '/OpenStackIdAuthenticator',
    '/oidc/session/whoami',
  ].includes(path.replace(/\/$/, ''));
export function legacySessionCookie(request) {
  const values = (request.headers.get('Cookie') || '').split(';').map((s) => s.trim());
  const sessions = values.filter((s) => /^PHPSESSID=[A-Za-z0-9,-]{1,256}$/.test(s));
  return sessions.length === 1 ? sessions[0] : null;
}
export function copyLegacySession(upstream, output) {
  for (const raw of upstream.headers.getSetCookie()) {
    const [pair, ...attributes] = raw.split(';').map((s) => s.trim());
    if (!/^PHPSESSID=[A-Za-z0-9,-]{0,256}$/.test(pair)) continue;
    // The origin currently emits a literal domain=$HOST_HEADER. Beta owns this
    // cookie: host-only, never shared with www or sent to an app's static origin.
    const lifetime = attributes.filter((s) => /^(?:Max-Age=-?\d+|Expires=[\w ,:-]+)$/i.test(s));
    output.append(
      'Set-Cookie',
      [pair, 'Path=/', 'Secure', 'HttpOnly', 'SameSite=Lax', ...lifetime].join('; ')
    );
  }
}
