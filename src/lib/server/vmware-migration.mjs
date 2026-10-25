import companies from '../companies/vmware-members.json' with { type: 'json' };
import { prepareMarketingLanding } from './marketing-landing.mjs';
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareVmwareMigration(content) {
  const path = '/vmware-migration-to-openstack/';
  const html = (value) => renderEditorialBody(value, path);
  const link = (value) => {
    const safe = safeSoftwareLink(value);
    if (!safe) throw new Error('Migration links and images must use safe HTTP(S) URLs.');
    return reviewHref(safe);
  };
  const button = (value) => ({ ...value, url: link(value.url) });
  const features = content.migrationFeatures.features ?? [];
  if (!Array.isArray(features) || features.some((f) => !['Openstack', 'VMWare'].includes(f.type)))
    throw new Error('Comparison features require an Openstack or VMWare column.');
  const columns = ['Openstack', 'VMWare'].map((type) => features.filter((f) => f.type === type));
  const rows = Array.from({ length: Math.max(...columns.map((c) => c.length)) }, (_, i) =>
    columns.map((c) => c[i] ?? null),
  );
  const metric = (value) => {
    if (!Number.isFinite(value.percentage) || value.percentage < 0 || value.percentage > 100)
      throw new Error('Survey percentages must be between 0 and 100.');
    return { ...value, html: html(value.abstract) };
  };
  return {
    ...prepareMarketingLanding(content, companies, path),
    planningBanner: {
      ...content.planningBanner,
      image: link(content.planningBanner.image),
      background: link(content.planningBanner.background),
      ctaButton: button(content.planningBanner.ctaButton),
    },
    migrationFeatures: {
      ...content.migrationFeatures,
      html: html(content.migrationFeatures.title),
      rows,
      ctaButton: button(content.migrationFeatures.ctaButton),
      sourceLink: {
        ...content.migrationFeatures.sourceLink,
        link: link(content.migrationFeatures.sourceLink.link),
      },
    },
    successCases: {
      ...content.successCases,
      html: html(content.successCases.title),
      tools: (content.successCases.tools ?? []).map((t) => ({
        ...t,
        image: link(t.image),
        learnMoreUrl: link(t.learnMoreUrl),
      })),
    },
    migrationGuide: {
      leftColumn: {
        ...content.migrationGuide.leftColumn,
        html: html(content.migrationGuide.leftColumn.abstract),
        image: link(content.migrationGuide.leftColumn.image),
      },
      rightColumn: {
        requestMetric: metric(content.migrationGuide.rightColumn.requestMetric),
        successMetric: metric(content.migrationGuide.rightColumn.successMetric),
      },
    },
  };
}
