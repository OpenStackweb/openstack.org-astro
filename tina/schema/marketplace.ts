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
    {
      type: 'object',
      name: 'resources',
      label: 'Optional sidebar for this page',
      description:
        'Empty means this page uses Marketplace — shared sidebar. Edit that collection to change the sidebar across Marketplace. Only fill these fields to give this page a different sidebar.',
      fields: [
        { type: 'string', name: 'title', label: 'Heading' },
        {
          type: 'object',
          name: 'links',
          label: 'Links',
          list: true,
          fields: [
            { type: 'string', name: 'label', label: 'Label', required: true },
            { type: 'string', name: 'link', label: 'Destination', required: true },
          ],
        },
      ],
    },
    { type: 'string', name: 'navigationLabel', label: 'Category navigation label' },
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
