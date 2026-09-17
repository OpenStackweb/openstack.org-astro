import downloads from '../content/paper-downloads.json' with { type: 'json' };
import revisions from '../content/paper-pdf-revisions.json' with { type: 'json' };
export function paperDownloadFor(path, locale = 'en_US') {
  if (!Object.hasOwn(downloads, path)) return null;
  return Object.hasOwn(downloads[path], locale) ? downloads[path][locale] : downloads[path].en_US;
}

// Paper identity stays stable; corrected archived PDFs get distinct asset URLs.
export function paperDownloadAssetFor(path, locale = 'en_US') {
  const slug = paperDownloadFor(path, locale);
  if (!slug) return null;
  return revisions[slug]?.path || `/assets/research-pdfs/${slug}.pdf`;
}
