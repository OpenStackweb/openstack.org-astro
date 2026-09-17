import { contentDescription } from './content-description.mjs';

// A company can offer several different service types. Keep those pages distinct
// and derive the summary from the same API-owned description visitors can read.
export function marketplaceMetadata(record, category) {
  return {
    title: `${record.name} — ${category.title} | OpenStack Marketplace`,
    description:
      contentDescription(record.descriptionHtml, record.href) ||
      `Explore ${record.name}${record.company.name ? ` from ${record.company.name}` : ''} in the OpenStack ${category.title} catalogue.`,
  };
}
