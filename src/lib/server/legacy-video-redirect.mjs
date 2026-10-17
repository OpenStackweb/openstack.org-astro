import routes from '../content/legacy-video-redirects.json' with { type: 'json' };

// Source-owned URL mapping; no live YouTube API calls or CMS video records.
export function legacyVideoDestination(pathname) {
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (!Object.hasOwn(routes, path)) return null;
  return `https://www.youtube.com/watch?v=${routes[path]}`;
}
