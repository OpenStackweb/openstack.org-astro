// Preferred identities preserve distinct releases and translations while
// consolidating verified archive duplicates and ignoring tracking parameters.
const archiveAliases = new Map([
  ['/summit/vancouver-2018/venues-2/', '/summit/vancouver-2018/venues/'],
  ['/summit/austin-2016/summit-schedule/track-list/', '/summit/austin-2016/categories/track-list/'],
]);

export function canonicalFor(path, { locale, release } = {}) {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  const url = new URL(archiveAliases.get(normalized) || normalized, 'https://www.openstack.org');
  if (locale && locale !== 'en_US') url.searchParams.set('lang', locale);
  if (release) url.searchParams.set('release', release);
  return url.href;
}
