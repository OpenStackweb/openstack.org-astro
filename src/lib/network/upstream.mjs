// Page delivery and assets must survive retirement of the legacy website.
// Independent Summit, Search, IDP and replacement services remain valid upstreams.
const retiredWebsiteHosts = new Set([
  'openstack.org',
  'www.openstack.org',
  'legacy.openstack.org',
  'beta.openstack.org',
]);
export function isRetiredWebsiteHost(hostname) {
  return retiredWebsiteHosts.has(hostname.toLowerCase().replace(/\.$/, ''));
}
export function independentFetch(input, options = {}, fetcher = fetch) {
  let url;
  try {
    url = new URL(input instanceof Request ? input.url : input);
  } catch {
    throw new Error('An absolute upstream HTTP URL is required.');
  }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw new Error('Invalid upstream HTTP destination.');
  if (isRetiredWebsiteHost(url.hostname))
    throw new Error('The retired website cannot be used as an upstream.');
  // No upstream redirect may silently reintroduce the retired PHP application.
  return fetcher(input, { ...options, redirect: 'manual' });
}
