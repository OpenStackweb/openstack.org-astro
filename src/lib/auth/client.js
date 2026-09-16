import { OidcClient, WebStorageStateStore } from 'oidc-client-ts';
import { createAuthConfig, authReturnPath } from './config.js';
import { createSession } from './session.mjs';
import { loadMemberProfile } from './member-profile.mjs';
let authConfig,
  client,
  session,
  pending,
  memberCache = null;
let state = Object.freeze({ status: 'checking', member: null, error: '' });
const listeners = new Set();
// The shell initializes one coordinator before any feature app subscribes.
// No beta client or redirect defaults: registration must be explicitly supplied.
export function configureAuth(options) {
  const configuration = createAuthConfig(options);
  if (authConfig && authConfig.client_id !== configuration.client_id)
    throw Error('Reload the page before changing the visitor sign-in client.');
  authConfig ||= configuration;
  return authConfig;
}
function configured() {
  if (!authConfig) throw Error('Visitor sign-in has not been configured.');
  if (globalThis.location && globalThis.location.origin !== new URL(authConfig.redirect_uri).origin)
    throw Error('Visitor sign-in is not available on this host.');
  return authConfig;
}

function emit(next) {
  state = Object.freeze(next);
  for (const fn of listeners) fn(state);
}
function protocol() {
  const config = configured();
  if (location.origin !== new URL(config.redirect_uri).origin)
    throw Error('Visitor sign-in is not available on this host.');
  return (client ||= new OidcClient({
    ...authConfig,
    stateStore: new WebStorageStateStore({ store: sessionStorage, prefix: 'oif.oidc.' }),
  }));
}
function store() {
  configured();
  return (session ||= createSession({
    storage: localStorage,
    lock: (fn) => navigator.locks.request('openstackuicore.lock.getTokenSilently', fn),
    refresh: (current, profile) =>
      protocol().useRefreshToken({
        state: {
          refresh_token: current.refreshToken,
          id_token: current.idToken,
          session_state: null,
          scope: authConfig.scope,
          profile,
        },
      }),
    notify: () => window.dispatchEvent(new Event('oif:auth')),
  }));
}
// The browser API session is independent of the retired SilverStripe session.
export async function login(back = location.pathname + location.search + location.hash) {
  configured();
  location.assign('/auth/login?' + new URLSearchParams({ back: authReturnPath(back) }));
}
export async function beginLogin(back) {
  const request = await protocol().createSigninRequest({
    state: { back: authReturnPath(back) },
    nonce: crypto.randomUUID(),
  });
  location.assign(request.url);
}
export async function completeLogin() {
  let response;
  try {
    response = await protocol().processSigninResponse(location.href);
  } catch (error) {
    // Show only fixed categories, never provider text, callback parameters or tokens.
    const message = String(error?.message || '');
    const reason = /nonce/.test(message)
      ? 'identity nonce validation'
      : /state/i.test(message)
        ? 'login state validation'
        : error?.error === 'invalid_grant'
          ? 'authorization code exchange'
          : /fetch|network|timeout/i.test(message)
            ? 'identity provider connection'
            : 'identity response validation';
    throw Error('Sign-in stopped during ' + reason + '. Please start a fresh sign-in.');
  }
  try {
    store().save(response);
  } catch {
    throw Error(
      'Sign-in completed at the identity provider, but the browser session could not be saved. Please retry.',
    );
  }
  history.replaceState(null, '', '/auth/callback');
  return authReturnPath(response.userState?.back);
}
export function clearSession() {
  store().clear();
  memberCache = null;
  localStorage.removeItem(`persist:root_${authConfig.client_id}`);
  document.cookie = 'idToken=; Max-Age=0; Path=/; Secure; SameSite=Lax';
  emit({ status: 'anonymous', member: null, error: '' });
}
export async function accessToken(force = false) {
  if (!navigator.locks) throw Error('Your browser does not support coordinated sign-in.');
  return store().token(force);
}
export async function memberProfile() {
  return loadMemberProfile({
    session: store(),
    accessToken,
    clearSession,
    endpoint: 'https://oifapi.openinfra.dev/api/v1/members/me',
  });
}
export async function refreshIdentity(force = false) {
  if (pending) return pending;
  pending = (async () => {
    if (!store().current()?.accessToken) {
      emit({ status: 'anonymous', member: null, error: '' });
      return;
    }
    try {
      const token = await accessToken(force);
      if (!memberCache || memberCache.token !== token)
        memberCache = { token, member: await memberProfile() };
      emit({ status: 'authenticated', member: memberCache.member, error: '' });
    } catch (error) {
      memberCache = null;
      emit({
        status: store().current() ? 'error' : 'anonymous',
        member: null,
        error: error.message,
      });
    }
  })().finally(() => {
    pending = null;
  });
  return pending;
}
function changed(event) {
  if (event.type === 'storage' && event.key && !['authInfo', 'oif.auth.epoch'].includes(event.key))
    return;
  memberCache = null;
  void refreshIdentity();
}
function visible() {
  if (document.visibilityState === 'visible') void refreshIdentity();
}
export function subscribe(fn) {
  configured();
  listeners.add(fn);
  fn(state);
  if (listeners.size === 1) {
    window.addEventListener('storage', changed);
    window.addEventListener('oif:auth', changed);
    window.addEventListener('pageshow', visible);
    document.addEventListener('visibilitychange', visible);
    void refreshIdentity();
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      window.removeEventListener('storage', changed);
      window.removeEventListener('oif:auth', changed);
      window.removeEventListener('pageshow', visible);
      document.removeEventListener('visibilitychange', visible);
    }
  };
}
export async function logout() {
  const hint = store().current()?.idToken;
  clearSession();
  const request = await protocol().createSignoutRequest({
    client_id: authConfig.client_id,
    id_token_hint: hint,
    state: { back: '/' },
  });
  location.assign(request.url);
}
export async function completeLogout() {
  await protocol().processSignoutResponse(location.href);
  clearSession();
  location.replace('/');
}
export const authService = Object.freeze({
  subscribe,
  login,
  logout: () => location.assign('/auth/signout'),
  memberProfile,
  refresh: () => refreshIdentity(true),
});
