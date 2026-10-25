import type { Collection } from 'tinacms';
export const surveyReports = {
  name: 'surveyReports',
  label: 'User Survey — reports archive',
  path: 'src/lib/content',
  match: { include: 'survey-reports' },
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/user-survey/reports/' },
  fields: [
    { type: 'string', name: 'eyebrow', label: 'Section label', required: true },
    { type: 'string', name: 'title', label: 'Heading', required: true },
    {
      type: 'string',
      name: 'introduction',
      label: 'Introduction',
      ui: { component: 'textarea' },
      required: true,
    },
    { type: 'string', name: 'note', label: 'Archive explanation', ui: { component: 'textarea' } },
    {
      type: 'object',
      name: 'reports',
      label: 'Publications (newest first)',
      list: true,
      ui: {
        itemProps: (item) => ({
          label: `${item.edition || 'Edition'} — ${item.title || 'Publication'}`,
        }),
      },
      fields: [
        { type: 'string', name: 'edition', label: 'Survey edition', required: true },
        { type: 'string', name: 'title', label: 'Publication title', required: true },
        { type: 'string', name: 'format', label: 'Publication type / format', required: true },
        {
          type: 'string',
          name: 'description',
          label: 'Description',
          ui: { component: 'textarea' },
        },
        { type: 'string', name: 'link', label: 'Publication URL', required: true },
      ],
    },
    { type: 'string', name: 'seoTitle', label: 'Search and browser title' },
    { type: 'string', name: 'description', label: 'Search description' },
  ],
} satisfies Collection;
