import type { Collection } from 'tinacms';
export const survey = {
  name: 'survey',
  label: 'User Survey — introduction',
  path: 'src/lib/content',
  match: { include: 'survey' },
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/user-survey/' },
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
    { type: 'string', name: 'resourcesTitle', label: 'Resources heading', required: true },
    {
      type: 'object',
      name: 'links',
      label: 'Resources',
      list: true,
      ui: { itemProps: (item) => ({ label: item.label || 'Resource' }) },
      fields: [
        { type: 'string', name: 'label', label: 'Label', required: true },
        { type: 'string', name: 'link', label: 'Destination', required: true },
      ],
    },
    { type: 'string', name: 'seoTitle', label: 'Search and browser title' },
    { type: 'string', name: 'description', label: 'Search description' },
  ],
} satisfies Collection;
