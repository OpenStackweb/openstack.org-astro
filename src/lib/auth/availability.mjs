import { ASTRO_AUTH_ORIGIN, createAuthConfig } from './config.js';

// Runtime opt-in belongs to the exact review host, never an editorial preview.
export function visitorAuthFor(origin, bindings = {}) {
  if (origin !== ASTRO_AUTH_ORIGIN || bindings.VISITOR_AUTH_ENABLED !== 'true') return null;
  try {
    return createAuthConfig({ origin, clientId: bindings.VISITOR_AUTH_CLIENT_ID });
  } catch {
    return null;
  }
}
