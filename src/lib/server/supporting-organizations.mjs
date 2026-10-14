import records from '../companies/supporting-organizations.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareSupportingOrganizations(content) {
  const path = '/community/supporting-organizations/';
  const html = (value) => renderEditorialBody(value ?? '', path);
  const company = (record) => {
    const logo = safeSoftwareLink(record.logo);
    const href = safeSoftwareLink(record.href);
    if (!logo || !href) throw new Error('Company links and logos must use safe HTTP(S) URLs.');
    return { ...record, logo, href: reviewHref(href) };
  };
  if (!content.title?.trim()) throw new Error('Supporting organizations title is required.');
  const donorIds = (content.infrastructureDonors ?? []).map((d) => d.companyId ?? d.id);
  if (new Set(donorIds).size !== donorIds.length) throw new Error('Duplicate donor selection.');
  const donors = donorIds.map((id) => {
    const record = records.donors.find((d) => d.id === id);
    if (!record) throw new Error('Unknown donor in the reviewed company snapshot.');
    return record;
  });
  const keys = (content.sections ?? []).map((s) => s.key);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate organization section.');
  return {
    ...content,
    introductionHtml: html(content.introduction),
    sections: (content.sections ?? []).map((section) => {
      if (!['platinum', 'gold', 'silver', 'infraDonors', 'supporting'].includes(section.key))
        throw new Error('Unknown organization section.');
      const companies = section.key === 'infraDonors' ? donors : (records.tiers[section.key] ?? []);
      return {
        ...section,
        descriptionHtml: html(section.description),
        companies: companies.map(company),
      };
    }),
  };
}
