import { flatten } from './catalog.mjs';

export function releaseLinks(snapshots, path, currentSlug) {
  const detail = path.match(/^\/software\/releases\/[^/]+\/components\/([^/]+)\/?$/);
  return [...snapshots]
    .sort((a, b) => {
      if (a.release.slug === currentSlug) return -1;
      if (b.release.slug === currentSlug) return 1;
      return (b.release.release_date ?? '').localeCompare(a.release.release_date ?? '');
    })
    .flatMap(({ release, catalog }) => {
      const component =
        detail &&
        flatten(catalog).find((item) => item.code_name.toLowerCase() === detail[1].toLowerCase());
      if (detail && !component) return [];
      return [
        {
          name: release.name,
          slug: release.slug,
          current: release.slug === currentSlug,
          href: component
            ? '/software' + component.href
            : `${path}?release=${encodeURIComponent(release.slug)}`,
        },
      ];
    });
}
