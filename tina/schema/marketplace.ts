import type { Collection } from 'tinacms';
export const marketplacePage = {
  name: 'marketplacePage',
  label: 'Marketplace — page copy',
  path: 'src/lib/content/marketplace',
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: ({ document }) => `/marketplace/${document._sys.filename}/`,
  },
  fields: [
    { type: 'image', name: 'icon', label: 'Section icon' },
    { type: 'string', name: 'title', label: 'Page heading', required: true, isTitle: true },
    { type: 'string', name: 'pageTitle', label: 'Search and browser title', required: true },
    {
      type: 'string',
      name: 'description',
      label: 'Search and sharing description',
      required: true,
    },
    {
      type: 'string',
      name: 'introduction',
      label: 'Introduction (inline Markdown)',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'contact',
      label: 'Contact call to action (inline Markdown)',
      ui: { component: 'textarea' },
    },
  ],
} satisfies Collection;
