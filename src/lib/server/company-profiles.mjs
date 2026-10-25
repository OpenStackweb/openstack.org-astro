import profiles from '../companies/profiles.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';
import { parseDocument, DomUtils } from 'htmlparser2';

export function prepareCompanyProfile(record, labels) {
  if (
    !record?.name ||
    !/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(record.slug) ||
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
