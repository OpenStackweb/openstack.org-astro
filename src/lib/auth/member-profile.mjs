import { independentFetch } from '../network/upstream.mjs';
// Keep a late response from one identity from changing a newer session.
export async function loadMemberProfile({
  session,
  accessToken,
  clearSession,
  endpoint,
  fetchProfile = fetch,
}) {
  const guardedFetch = (input, options) => independentFetch(input, options, fetchProfile);
  const generation = session.epoch();
  const token = await accessToken();
  const assertCurrent = () => {
    if (session.epoch() !== generation || session.current()?.accessToken !== token)
      throw Error('Your session changed. Please retry.');
  };
  assertCurrent();
  const response = await guardedFetch(endpoint, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    credentials: 'omit',
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  // Check before processing errors: an old 401 must not sign out a new user.
  assertCurrent();
  if (response.status === 401) {
    clearSession();
    throw Error('Your session has expired. Please sign in again.');
  }
  if (!response.ok) throw Error('Your account could not be loaded. Please retry.');
  const member = await response.json();
  assertCurrent();
  if (!member || typeof member !== 'object' || Array.isArray(member))
    throw Error('Your account could not be loaded. Please retry.');
  const details = {};
  // Only these private fields reach the account view; never relay groups,
  // permissions, agreements, tokens or arbitrary service expansions.
  for (const key of ['email', 'bio', 'country', 'state', 'company', 'membership_type'])
    if (typeof member[key] === 'string') details[key] = member[key];
  for (const key of ['display_on_site', 'subscribed_to_newsletter'])
    if (typeof member[key] === 'boolean') details[key] = member[key];
  return {
    ...details,
    name: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'My account',
    id: member.id,
  };
}
