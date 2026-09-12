import { flatten, safeSoftwareLink } from './catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

const normalize = (path) => path.replace(/\/$/, '');

/** @param {any} navigation
 * @param {{path?:string, release?:{slug:string}, catalog?:any[]}} options
 */
export function softwareNavigation(navigation, { path = '', release, catalog = [] } = {}) {
  const component = flatten(catalog).find(
    (item) => normalize('/software' + item.href).toLowerCase() === normalize(path).toLowerCase()
  );
  const activePath = component ? '/software/project-navigator/' + component.rootCategorySlug : path;
  const items =
    navigation.items.find((item) => normalize(item.link || '') === '/software')?.items || [];
  const buildLinks = (items, includeChildren = true) =>
    items
      .filter((item) => item.display !== false && !item.requiresAuth && item.link && item.title)
      .flatMap((item) => {
        if (!safeSoftwareLink(item.link)) return [];
        const href = reviewHref(item.link);
        const target = new URL(href, 'https://www.openstack.org');
        const local = href.startsWith('/') && !href.startsWith('//');
        const catalogPage =
          /^\/software(?:\/project-navigator\/[a-z0-9-]+\/?|\/sample-configs\/?)$/.test(
            target.pathname
          );
        if (local && catalogPage && release?.slug) target.searchParams.set('release', release.slug);
        return [
          {
            title: item.title,
            href: local ? target.pathname + target.search + target.hash : href,
            active: local && normalize(target.pathname) === normalize(activePath),
            children: includeChildren ? buildLinks(item.items || [], false) : [],
          },
        ];
      });
  return buildLinks(items);
}
