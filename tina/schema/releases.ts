import type { Collection } from 'tinacms';
import { releaseSlugError, validateReleaseAnnouncement } from '../release-validation.mjs';

export const releaseAnnouncement = {
  name: 'releaseAnnouncement', label: 'Release announcements',
  path: 'src/lib/content/releases', format: 'json',
  defaultItem: { description: '', body: '', contributorIntroduction: '', contributors: [] },
  ui: {
    allowedActions: { create: true, delete: false },
    // Preview documents are loaded by filename; keep it identical to the public slug.
    filename: { readonly: true, slugify: values => values.slug || '' },
    router: ({ document }) => `/cms-preview/release/${encodeURIComponent(document._sys.filename)}`,
    beforeSubmit: async ({ values, form }) => {
      const normalized = { ...values, description: values.description ?? '',
        body: values.body ?? '', contributorIntroduction: values.contributorIntroduction ?? '',
        contributors: values.contributors ?? [] };
      validateReleaseAnnouncement(normalized, form.initialValues?.slug);
      return normalized;
    },
  },
  fields: [
    { type: 'string', name: 'slug', label: 'Release slug', required: true,
      description: 'Used in /software/openstack-SLUG/. Published slugs must stay unchanged.',
      // Tina forwards Final Form's field state, including its initial value.
      // Field validation explains the error before the whole-form guard runs.
      ui: { validate: (value, _values, meta) => releaseSlugError(value, (meta as { initial?: string }).initial) } },
    { type: 'string', name: 'title', label: 'Announcement headline', isTitle: true, required: true },
    { type: 'string', name: 'description', label: 'Search and sharing description', ui: { component: 'textarea' } },
    { type: 'string', name: 'body', label: 'Announcement content (HTML or Markdown)',
      description: 'Editorial announcement only. Software releases and component records are managed in the Software service.',
      ui: { component: 'textarea' } },
    { type: 'string', name: 'contributorIntroduction', label: 'Contributor introduction', ui: { component: 'textarea' } },
    { type: 'string', name: 'contributors', label: 'Public contributor credits', list: true,
      ui: { component: 'release-credits' },
      description: 'Preserve published names and their order. This does not edit member profiles or service statistics.' },
  ],
} satisfies Collection;
