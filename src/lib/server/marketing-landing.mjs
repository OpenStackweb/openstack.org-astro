import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareMarketingLanding(content, companies, path) {
  const link = (value) => {
    const url = safeSoftwareLink(value);
    if (!url) throw new Error('Marketing page links and images must use safe HTTP(S) URLs.');
    return reviewHref(url);
  };
  const button = (value) => ({ ...value, url: link(value.url) });
  if (!content.header?.title?.trim()) throw new Error('Marketing page title is required.');
  if (!Array.isArray(content.migrationStories)) throw new Error('Marketing quotes must be a list.');
  const selected = (content.supportingFoundationMembers.companies ?? []).map(
    ({ id, companyId }) => {
      id = companyId ?? id;
      const company = companies.find((item) => item.id === id);
      if (!company)
        throw new Error(`Marketing contributor ${id} is not in the reviewed service snapshot.`);
      return { ...company, logo: link(company.logo), url: link(company.url) };
    },
  );
  if (new Set(selected.map((c) => c.id)).size !== selected.length)
    throw new Error('Marketing contributors must not be repeated.');
  return {
    ...content,
    header: {
      ...content.header,
      image: link(content.header.image),
      html: renderEditorialBody(content.header.abstract, path),
      joinButton: button(content.header.joinButton),
      migrationButton: button(content.header.migrationButton),
    },
    supportingFoundationMembers: {
      ...content.supportingFoundationMembers,
      html: renderEditorialBody(content.supportingFoundationMembers.title, path),
      companies: selected,
      ctaButton: button(content.supportingFoundationMembers.ctaButton),
    },
    whitePaperBanner: {
      ...content.whitePaperBanner,
      html: renderEditorialBody(content.whitePaperBanner.abstract, path),
      ctaButton: button(content.whitePaperBanner.ctaButton),
    },
  };
}
