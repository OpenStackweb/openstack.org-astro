import { categories, fetchCategory } from '../marketplace/public-api.mjs';

export const MARKETPLACE_ORIGIN = 'https://marketplace-staging.openstack.org';
export function marketplaceServiceOrigin(bindings = {}) {
  const origin = bindings.MARKETPLACE_SERVICE_ORIGIN;
  if (!origin) throw new Error('Marketplace backend is not configured');
  const expected =
    bindings.SITE_DEPLOYMENT === 'production'
      ? 'https://marketplace.openstack.org'
      : MARKETPLACE_ORIGIN;
  if (origin !== expected) throw new Error('Unapproved Marketplace origin for this deployment');
  return origin;
}
/** Only public catalogue requests. No request headers, cookies or credentials.
 * @returns {Promise<typeof import('../marketplace/catalog.json')>}
 */
export async function loadMarketplaceCatalogue(bindings, slug, fetcher = fetch) {
  const origin = marketplaceServiceOrigin(bindings);
  const category = categories.find((item) => item.slug === slug);
  const loaded = category ? await fetchCategory(origin, category, fetcher) : null;
  return {
    scope:
      'Public catalogue read directly from the new Marketplace service; source-owned records remain outside the CMS.',
    source: origin,
    fetchedAt: new Date().toISOString(),
    categories: categories.map((item) =>
      item.slug === loaded?.slug ? loaded : { ...item, records: [] },
    ),
  };
}
