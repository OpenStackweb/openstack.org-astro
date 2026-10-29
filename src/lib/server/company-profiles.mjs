import profiles from '../companies/profiles.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';
import { parseDocument, DomUtils } from 'htmlparser2';

export function prepareCompanyProfile(record, labels) {
  if (
    !record?.name ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(record.slug) ||
    record.slug.includes('..')
  )
    throw new Error('Invalid public company profile.');
  const link = (value) => {
    const safe = safeSoftwareLink(value);
    if (!safe) throw new Error('Company links and logos require safe HTTP(S) URLs.');
    return reviewHref(safe);
  };
  const titles = {
    description: labels.description,
    contributions: `${labels.contributions} ${record.name}`,
    products: labels.products,
    contact: labels.contact,
  };
  const descriptionHtml = renderEditorialBody(record.sections.description || '', '/').replace(
    /<\/(?:p|div|li|h[1-6]|blockquote)>|<br\s*\/?\s*>/gi,
    '$& ',
  );
  const descriptionText = DomUtils.innerText(parseDocument(descriptionHtml).children)
    .replace(/\s+/g, ' ')
    .trim();
  const description =
    descriptionText.length > 200
      ? descriptionText.slice(0, 200).replace(/\s+\S*$/, '') + '…'
      : descriptionText || `${record.name} · ${labels.pageTitle}`;
  return {
    ...record,
    description,
    logo: record.logo ? link(record.logo) : '',
    fallbackLogo: record.fallbackLogo ? link(record.fallbackLogo) : '',
    website: record.website ? link(record.website) : '',
    sections: Object.entries(record.sections).map(([key, body]) => {
      if (!Object.hasOwn(titles, key)) throw new Error('Unknown public profile section.');
      // Legacy base href makes relative company-authored links root-relative.
      return { key, title: titles[key], html: renderEditorialBody(body, '/') };
    }),
  };
}
export function findCompanyProfile(slug, labels) {
  const record = profiles.find((p) => p.slug === slug);
  return record ? prepareCompanyProfile(record, labels) : null;
}

/** Published company profiles come from Marketplace; unported profiles retain
 * their imported snapshot until a company administrator publishes a replacement. */
export async function loadCompanyProfile(slug, labels, bindings, fetcher = fetch) {
  const fallback = () => findCompanyProfile(slug, labels);
  if (!bindings?.MARKETPLACE_SERVICE_ORIGIN) return fallback();
  const { MARKETPLACE_ORIGIN } = await import('./marketplace-catalogue.mjs');
  const { independentFetch } = await import('../network/upstream.mjs');
  if (
    bindings.MARKETPLACE_SERVICE_ORIGIN !== MARKETPLACE_ORIGIN ||
    bindings.SITE_DEPLOYMENT === 'production'
  )
    throw new Error('Unapproved company profile origin');
  if (typeof slug !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug) || slug.includes('..'))
    return null;
  const response = await independentFetch(
    `${MARKETPLACE_ORIGIN}/api/public/v1/companies/${encodeURIComponent(slug)}`,
    { signal: AbortSignal.timeout(10000), redirect: 'error' },
    fetcher,
  );
  if (response.status === 404) return fallback();
  if (!response.ok) throw new Error('Company profile unavailable');
  const profile = await response.json();
  if (profile.slug !== slug || typeof profile.name !== 'string')
    throw new Error('Invalid company profile');
  const text = (key) => (typeof profile[key] === 'string' ? profile[key] : '');
  const escape = (value) =>
    value.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  return prepareCompanyProfile(
    {
      slug,
      name: profile.name,
      website: text('website'),
      logo: text('large_logo') || text('logo'),
      fallbackLogo: text('logo'),
      industry: text('industry'),
      sections: {
        description: text('description'),
        contributions: text('contributions'),
        products: text('products'),
        contact: escape(text('contact_email')),
      },
    },
    labels,
  );
}
