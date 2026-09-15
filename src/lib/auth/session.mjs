// Framework-neutral coordinator. Tokens stay behind this interface; subscribers
// receive only public identity/session state. UICore storage remains compatible.
export function createSession({
  storage,
  lock,
  refresh,
  now = () => Date.now(),
  notify = () => {},
}) {
  const key = 'authInfo',
    profileKey = 'oif.auth.profile',
    epochKey = 'oif.auth.epoch';
  const read = (k) => {
    try {
      return JSON.parse(storage.getItem(k) || 'null');
    } catch {
      return null;
    }
  };
  const epoch = () => storage.getItem(epochKey) || '';
  const clear = () => {
    storage.setItem(epochKey, crypto.randomUUID());
    storage.removeItem(key);
    storage.removeItem(profileKey);
    notify();
  };
  function save(response, prior) {
    if (
      typeof response.access_token !== 'string' ||
      !response.access_token ||
      !Number.isFinite(response.expires_in) ||
      response.expires_in <= 0
    )
      throw Error('Invalid authentication response.');
    // A fresh sign-in supersedes refreshes started by any older tab/session.
    // Refresh saves keep their generation so coordinated consumers still share it.
    if (!prior) storage.setItem(epochKey, crypto.randomUUID());
    storage.setItem(
      key,
      JSON.stringify({
        accessToken: response.access_token,
        expiresIn: response.expires_in,
        accessTokenUpdatedAt: Math.floor(now() / 1000),
        refreshToken: response.refresh_token || prior?.refreshToken,
        idToken: response.id_token || prior?.idToken,
      })
    );
    storage.setItem(profileKey, JSON.stringify(response.profile));
    notify();
  }
  async function token(force = false) {
    return lock(async () => {
      const current = read(key),
        generation = epoch();
      if (!current?.accessToken) throw Error('Sign in to connect your account.');
      const expires = Number(current.accessTokenUpdatedAt) + Number(current.expiresIn);
      if (!force && Number.isFinite(expires) && expires > now() / 1000 + 60)
        return current.accessToken;
      if (!current.refreshToken || !read(profileKey)) {
        clear();
        throw Error('Your session has expired. Please sign in again.');
      }
      let response;
      try {
        response = await refresh(current, read(profileKey));
      } catch (error) {
        if (epoch() === generation && ['invalid_grant', 'invalid_token'].includes(error?.error))
          clear();
        throw Error('Your session could not be renewed. Please retry or sign in again.');
      }
      if (epoch() !== generation) throw Error('Your session changed. Please retry.');
      save(response, current);
      return response.access_token;
    });
  }
  return { token, save, clear, current: () => read(key), profile: () => read(profileKey), epoch };
}
