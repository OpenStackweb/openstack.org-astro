import { isEditorialPath } from '../legacy-routes.js';

export const authConfig = Object.freeze({
  authority: 'https://id.openinfra.dev',
  // Discovery is public but lacks browser CORS headers. These fixed endpoints
  // were verified against the provider's discovery document on 2026-09-08.
  metadata: {
    issuer: 'https://id.openinfra.dev',
    authorization_endpoint: 'https://id.openinfra.dev/oauth2/auth',
    token_endpoint: 'https://id.openinfra.dev/oauth2/token',
    userinfo_endpoint: 'https://id.openinfra.dev/api/v1/users/info',
    end_session_endpoint: 'https://id.openinfra.dev/oauth2/end-session',
    jwks_uri: 'https://id.openinfra.dev/oauth2/certs',
  },
  client_id: 'dE73lGJBmKDSka1nhz6W~d2HG.6T6ImB.openstack.client',
  redirect_uri: 'https://beta.openstack.org/auth/callback',
  post_logout_redirect_uri: 'https://beta.openstack.org/auth/logout',
  scope:
    'openid offline_access profile https://openstackid-resources.openstack.org/members/read/me',
  // This IDP requires explicit consent whenever offline_access is requested.
  prompt: 'consent',
  response_type: 'code',
  response_mode: 'query',
  loadUserInfo: false,
  requestTimeoutInSeconds: 15,
});
export function authReturnPath(value) {
  if (
    typeof value !== 'string' ||
    value.length > 2048 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\s]/.test(value) ||
    /%(?:2f|5c|2e|25)/i.test(value)
  )
    return '/';
  const url = new URL(value, 'https://beta.openstack.org');
  return ['/review/auth', '/', '/profile/', '/marketplace/'].includes(url.pathname) ||
    isEditorialPath(url.pathname) ||
    /^\/software(?:\/[a-zA-Z0-9_/-]*)?$/.test(url.pathname)
    ? url.pathname + url.search + url.hash
    : '/';
}
