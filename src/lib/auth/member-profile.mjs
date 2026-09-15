// Keep a late response from one identity from changing a newer session.
export async function loadMemberProfile({ session, accessToken, clearSession, endpoint, fetchProfile = fetch }) {
  const generation = session.epoch();
  const token = await accessToken();
  const assertCurrent = () => {
    if (session.epoch() !== generation || session.current()?.accessToken !== token)
      throw Error('Your session changed. Please retry.');
  };
  assertCurrent();
  const response = await fetchProfile(endpoint, {
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
  return {
    name: [member.first_name, member.last_name].filter(Boolean).join(' ') || 'My account',
    id: member.id,
  };
}
