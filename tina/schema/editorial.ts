import type { Collection } from 'tinacms';
import pages from '../editorial-pages.json';
import { industryFields } from './industry';
import { faqField } from './faq';
import { summitHighlightsField } from './summit-highlights';
import { validateHighlights } from '../highlights-validation.mjs';
import { validateFaqSubmission } from '../faq-validation.mjs';

// Explicit reviewed editorial cohort; service records stay in their owning apps.
export const editorial = {
  name: 'editorial', label: 'Editorial pages',
  path: 'src/lib/content/pages', format: 'json',
  match: { include: `{${pages.map((page) => page.filename).join(',')}}` },
  ui: {
    beforeSubmit: async ({ values }) => { validateFaqSubmission(values.faq); validateHighlights(values.highlights); return values; },
    allowedActions: { create: false, delete: false },
    router: ({ document }) => pages.find((page) => page.filename === document._sys.filename)?.path,
  },
  fields: [
    ...industryFields,
    faqField,
    summitHighlightsField,
    { type: 'string', name: 'path', required: true, ui: { component: () => null } },
    // Preserve the shared event relationship; it is not independent page copy.
    { type: 'string', name: 'archiveEvent', ui: { component: () => null } },
    { type: 'string', name: 'title', label: 'Page heading', isTitle: true, required: true },
    { type: 'string', name: 'seoTitle', label: 'Search and social title' },
    { type: 'string', name: 'socialImageAlt', label: 'Sharing image description', description: 'Describe what the sharing image shows. Update this if the page hero or sharing image changes.' },
    { type: 'string', name: 'description', label: 'Search and social description', ui: { component: 'textarea' } },
    { type: 'string', name: 'body', label: 'Page content (HTML or Markdown)',
      description: 'Existing HTML is preserved. Edits appear in the page preview; keep links, headings and image descriptions.',
      ui: { component: 'textarea' } },
    { type: 'string', name: 'archiveNotice', label: 'Archive note', ui: { component: 'textarea' } },
    { type: 'object', name: 'sectionNavigation', label: 'Section links', list: true,
      ui: { itemProps: (item) => ({ label: item.label || 'Link' }) },
      fields: [
        { type: 'string', name: 'label', label: 'Link text', required: true },
        { type: 'string', name: 'url', label: 'Destination', required: true },
      ] },
  ],
} satisfies Collection;
