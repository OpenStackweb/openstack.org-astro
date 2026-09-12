import { reviewStatusFor } from './review-status.mjs';
import paperRoutes from './content/paper-routes.json' with { type: 'json' };
import { scheduleRoute } from './schedule-routes.js';
import redirects from './content/redirects.json' with { type: 'json' };
import companySlugs from './companies/profile-slugs.json' with { type: 'json' };
import editorialPaths from './content/editorial-paths.json' with { type: 'json' };
import conferenceKeys from './content/conference-keys.json' with { type: 'json' };

export function isCompanyProfilePath(path) {
  const match = /^\/community\/supporting-organizations\/profile\/([^/]+)\/?$/.exec(path);
  return !!match && companySlugs.includes(match[1]);
}

export function isEditorialPath(path) {
  const canonical = path.endsWith('/') ? path : `${path}/`;
  return (
    Object.hasOwn(paperRoutes, canonical) ||
    editorialPaths.includes(canonical) ||
    conferenceKeys.some((key) => canonical === `/summit/${key}/`)
  );
}

// Public sections selected from marketing-site/netlify-config.yaml.
// Auth, administration, surveys, and APIs are deliberately not migrated here.
const sections = [
  'marketplace',
  'use-cases',
  'user-stories',
  'brand',
  'legal',
  'privacy',
  'foundation',
  'learn',
  'papers',
  'project-mascots',
  'public-clouds',
  'private-clouds',
  'remote-clouds',
  'consultants',
  'trainings',
  'implementations',
  'openstack-map',
  'events',
  'ptg',
  'videos',
  'marketing',
  'blog',
  'community/members',
];
const assets = [
  'themes',
  'framework',
  'assets',
  'navbar',
  'images',
  'favicon',
  'googlemaps',
  'maps_images',
  'node_modules',
];
export function isLegacyPath(path) {
  if (/%(?:2e|2f|5c|25)|\\/i.test(path)) return false;
  if (
    /^\/community\/speakers(?:\/(?:results|suggestions|profile\/\d+(?:\/[\w-]+)?))?\/?$/.test(path)
  )
    return true;
  if (/^\/speaker_bureau\/(?:css|js)\/[\w.-]+\.(?:css|js)$/.test(path)) return true;
  if (/^\/userprofile\/(?:ListAffiliations|ListOrganizations|AffiliationsCount)\/?$/.test(path))
    return true;
  if (
    /^\/profile(?:\/EditProfileForm)?\/?$/.test(path) ||
    /^\/community\/members\/profile\/\d+(?:\/[\w-]+)?\/?$/.test(path)
  )
    return true;
  if (
    /^\/registration\/(?:css|javascript)\/[\w./-]+\.(?:css|js)$/.test(path) &&
    !path.includes('..')
  )
    return true;
  if (
    /(?:^|\/)(?:admin|security|api|profile|userprofile|registration|login|logout|edit|delete|remove|save|create|signup|register|action|oidc|OpenStackIdAuthenticator)(?:\/|$)|form(?:\/|$)/i.test(
      path
    )
  )
    return false;
  return [...sections, ...assets].some(
    (prefix) => path === `/${prefix}` || path.startsWith(`/${prefix}/`)
  );
}
export function reviewHref(value) {
  if (!value) return '#';
  let url;
  try {
    url = new URL(value, 'https://www.openstack.org');
  } catch {
    return value;
  }
  if (
    ['www.openstack.org', 'openstack.org', 'legacy.openstack.org', 'beta.openstack.org'].includes(
      url.hostname
    ) &&
    (url.pathname === '/' ||
      /^\/search\/?$/.test(url.pathname) ||
      redirects.some(
        (rule) => rule.from === (url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`)
      ) ||
      isCompanyProfilePath(url.pathname) ||
      /^\/(?:latest-release|users)\/?$/.test(url.pathname) ||
      /^\/community\/supporting-organizations\/?$/.test(url.pathname) ||
      /^\/coa\/?$/.test(url.pathname) ||
      url.pathname === '/community' ||
      url.pathname === '/community/' ||
      url.pathname === '/vmware-migration-to-openstack' ||
      url.pathname === '/vmware-migration-to-openstack/' ||
      url.pathname === '/openstack-for-ai' ||
      url.pathname === '/openstack-for-ai/' ||
      url.pathname === '/software' ||
      url.pathname.startsWith('/software/') ||
      reviewStatusFor(url.pathname) ||
      isEditorialPath(url.pathname) ||
      scheduleRoute(url.pathname) ||
      isLegacyPath(url.pathname))
  ) {
    return url.pathname + url.search + url.hash;
  }
  return url.href;
}
