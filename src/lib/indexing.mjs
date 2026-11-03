const privatePaths =
  /^\/(?:admin|auth|api|profile|marketplaceadmin|review|cms-preview|tina-island|comparison|search)(?:\/|$)|^\/user-survey\/(?:service|staff)(?:\/|$)/;

export function publicIndexingEnabled(url, bindings = {}) {
  return (
    url.origin === 'https://www.openstack.org' &&
    bindings.SITE_DEPLOYMENT === 'production' &&
    bindings.SITE_INDEXING_ENABLED === 'true'
  );
}

export function pageRobots(url, bindings = {}, status = 200) {
  return publicIndexingEnabled(url, bindings) && status === 200 && !privatePaths.test(url.pathname)
    ? 'index, follow'
    : 'noindex, nofollow';
}

export function robotsText(url, bindings = {}) {
  if (!publicIndexingEnabled(url, bindings)) return 'User-agent: *\nDisallow: /\n';
  return (
    'User-agent: *\nAllow: /\n' +
    [
      '/admin',
      '/auth/',
      '/api/',
      '/profile',
      '/marketplaceadmin',
      '/review/',
      '/cms-preview/',
      '/tina-island/',
      '/comparison',
      '/search',
      '/user-survey/service/',
      '/user-survey/staff',
    ]
      .map((path) => `Disallow: ${path}\n`)
      .join('')
  );
}
