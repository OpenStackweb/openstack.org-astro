/** Keep host-only application sessions on the registered production callback host. */
export function productionHostRedirect(request, env) {
  const url = new URL(request.url);
  if (env.SITE_DEPLOYMENT !== 'production' || url.hostname !== 'openstack.org') return null;
  url.hostname = 'www.openstack.org';
  url.protocol = 'https:';
  url.port = '';
  return new Response(null, {
    status: 308,
    headers: { Location: url.href, 'Cache-Control': 'private, no-store' },
  });
}
