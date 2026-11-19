import { independentFetch } from '../network/upstream.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';

const endpoint =
  'https://openstackid-resources.openstack.org/api/public/v1/sponsored-projects/1?expand=sponsorship_types,sponsorship_types.supporting_companies,sponsorship_types.supporting_companies.company';
export function companyLogoIndex(payload) {
  if (payload?.id !== 1 || !Array.isArray(payload.sponsorship_types))
    throw new Error('Invalid company catalogue');
  const index = new Map();
  const owners = new Map();
  for (const tier of payload.sponsorship_types) {
    for (const entry of tier.supporting_companies ?? []) {
      const company = entry.company;
      if (!company || !Number.isInteger(company.id)) continue;
      const logo = safeSoftwareLink(company.logo);
      if (!logo) continue;
      for (const key of [
        company.url_segment && `slug:${company.url_segment}`,
        company.name && `name:${company.name}`,
      ].filter(Boolean)) {
        if (owners.has(key) && owners.get(key) !== company.id) {
          index.delete(key);
          owners.set(key, null);
          continue;
        }
        owners.set(key, company.id);
        index.set(key, logo);
      }
    }
  }
  return index;
}
export function currentCompanyLogo(record, index) {
  const slug = record.href?.match(/\/profile\/([^/?#]+)\/?$/)?.[1];
  return index?.get(`slug:${slug}`) || index?.get(`name:${record.name}`) || record.logo;
}
export function createCompanyLogoLoader(fetcher = fetch, now = Date.now) {
  let logos = new Map(),
    expires = 0,
    pending;
  return async () => {
    if (now() < expires) return logos;
    if (pending) return pending;
    pending = (async () => {
      try {
        const response = await independentFetch(
          endpoint,
          {
            signal: AbortSignal.timeout(2000),
            cf: { cacheTtl: 300, cacheEverything: true },
          },
          fetcher,
        );
        if (!response.ok) throw new Error('Company catalogue unavailable');
        logos = companyLogoIndex(await response.json());
        expires = now() + 300000;
      } catch {
        // Keep last-good logos, or the refreshed imported snapshot on cold start.
        expires = now() + 30000;
      }
      return logos;
    })();
    try {
      return await pending;
    } finally {
      pending = undefined;
    }
  };
}
export const loadCompanyLogos = createCompanyLogoLoader();
