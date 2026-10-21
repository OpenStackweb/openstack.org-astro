import { isRetiredWebsiteHost } from './network/upstream.mjs';

// WordPress is a separate application. Migration notices must not send users
// back to SilverStripe forms or pages when the old website is retired.
export function retainedApplicationLink(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (
      isRetiredWebsiteHost(url.hostname) &&
      !(url.hostname === 'www.openstack.org' && /^\/blog(?:\/|$)/.test(url.pathname))
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
