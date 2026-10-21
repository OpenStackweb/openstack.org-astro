import snapshot from '../marketplace/catalog.json' with { type: 'json' };
import { categories, fetchCategory } from '../marketplace/public-api.mjs';

export const MARKETPLACE_ORIGIN = 'https://marketplace-staging.openstack.org';
/** Only public catalogue requests. No request headers, cookies or credentials.
 * @returns {Promise<typeof snapshot>}
 */
export async function loadMarketplaceCatalogue(bindings, slug, fetcher = fetch) {
  const origin = bindings?.MARKETPLACE_SERVICE_ORIGIN;
  if (!origin) return snapshot;
  if (origin !== MARKETPLACE_ORIGIN) throw new Error('Unapproved Marketplace origin');
  const category = categories.find((item) => item.slug === slug);
  const loaded = category ? await fetchCategory(origin, category, fetcher) : null;
  return {
    ...snapshot,
    source: origin,
    fetchedAt: new Date().toISOString(),
    categories: categories.map((item) =>
      item.slug === loaded?.slug ? loaded : { ...item, records: [] },
    ),
  };
}
