import partners from '../companies/coa-partners.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareCoa(content) {
  const html = (value) => renderEditorialBody(value ?? '', '/coa/');
  const link = (value) => {
    const safe = safeSoftwareLink(value);
    if (!safe) throw new Error('COA links and images require safe HTTP(S) URLs.');
    return reviewHref(safe);
  };
  const banner = (b) => ({
    ...b,
    descriptionHtml: html(b.description),
    ctaHtml: html(b.ctaText),
    ctaLink: link(b.ctaLink),
    backgroundImage: link(b.backgroundImage),
  });
  const selected = content.trainingPartners.partners ?? [];
  if (new Set(selected.map((p) => p.id)).size !== selected.length)
    throw new Error('Duplicate training partner.');
  if (!content.hero.title?.trim()) throw new Error('COA title is required.');
  const details = content.examDetails;
  return {
    ...content,
    hero: { ...banner(content.hero), ctaLogo: link(content.hero.ctaLogo) },
    howToGetStarted: banner(content.howToGetStarted),
    trainingPartners: {
      ...content.trainingPartners,
      descriptionHtml: html(content.trainingPartners.description),
      footerHtml: html(content.trainingPartners.footerText),
      partners: selected.map(({ id }) => {
        const partner = partners.find((p) => p.id === id);
        if (!partner) throw new Error('Unknown training partner in the reviewed service snapshot.');
        return {
          ...partner,
          logo: link(partner.logo),
          href: link(`/marketplace/training/${partner.url_segment}/${partner.id}`),
        };
      }),
    },
    examDetails: {
      ...details,
      descriptionHtml: html(details.description),
      releaseInfo: {
        ...details.releaseInfo,
        logo: link(details.releaseInfo.logo),
        imgLink: details.releaseInfo.imgLink ? link(details.releaseInfo.imgLink) : '',
      },
      columns: [0, 1].map((column) =>
        details.details
          .filter((_, i) => i % 2 === column)
          .map((d) => ({ ...d, descriptionHtml: html(d.description) }))
      ),
      footer: {
        ...details.footer,
        titleHtml: html(details.footer.title),
        ctaHtml: html(details.footer.ctaText),
        ctaLink: link(details.footer.ctaLink),
      },
    },
  };
}
