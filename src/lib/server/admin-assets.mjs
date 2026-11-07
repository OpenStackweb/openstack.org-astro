/** Serve Tina's static shell after canonical-host routing, without Astro's catch-all. */
export function adminAssetResponse(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return null;
  return env.ASSETS.fetch(request);
}
