// Editorial selection is independent of the Software API's structured Current release.
export function latestReleasePath(link, slugs) {
  if (typeof link !== 'string' || !link.trim())
    throw new Error('Select a latest release announcement.');
  const url = new URL(link, 'https://www.openstack.org');
  if (
    url.protocol !== 'https:' ||
    !['www.openstack.org', 'openstack.org', 'beta.openstack.org'].includes(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Latest release must link to a published local announcement.');
  const match = /^\/software\/openstack-([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(url.pathname);
  if (!match || !slugs.includes(match[1]))
    throw new Error('Latest release announcement has not been published.');
  return `/software/openstack-${match[1]}/`;
}
