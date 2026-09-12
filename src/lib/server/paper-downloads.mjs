import downloads from '../content/paper-downloads.json' with { type: 'json' };
export function paperDownloadFor(path, locale = 'en_US') {
  if (!Object.hasOwn(downloads, path)) return null;
  return Object.hasOwn(downloads[path], locale) ? downloads[path][locale] : downloads[path].en_US;
}
