import current from '$lib/software/catalog.json';
import release from '$lib/software/catalog-release.json';
import samples from '$lib/software/sample-configurations.json';
import history from '$lib/software/release-history.json';
import { releaseLinks } from '$lib/software/release-links.mjs';

// Every release retains its own API membership and sample configurations.
const catalogs = new Map(history.map((item) => [item.release.slug, item]));
catalogs.set(release.slug, { catalog: current, release, samples: samples.types });

export function softwareCatalog(slug = release.slug) {
  return catalogs.get(slug.toLowerCase());
}

export function softwareReleaseLinks(path) {
  return releaseLinks([...catalogs.values()], path, release.slug);
}
