import { createAuthConfig } from './config.js';

// Default remains review. Production needs its own explicit role and exact host.
export function visitorAuthFor(origin, bindings = {}) {
  if (bindings.VISITOR_AUTH_ENABLED !== 'true') return null;
  try {
    const deployment = bindings.SITE_DEPLOYMENT ?? 'review';
    return Object.freeze({
      ...createAuthConfig({ origin, clientId: bindings.VISITOR_AUTH_CLIENT_ID, deployment }),
      deployment,
    });
  } catch {
    return null;
  }
}
