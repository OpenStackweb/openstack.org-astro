import type { Collection } from 'tinacms';
export const marketplaceShared = {
  name: 'marketplaceShared',
  label: 'Marketplace — shared sidebar',
  path: 'src/lib/content',
  match: { include: 'marketplace-shared' },
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/marketplace/public-clouds/',
  },
  fields: [
    { type: 'string', name: 'privateCloudLabel', label: 'Private cloud navigation group label' },
    {
      type: 'object',
      name: 'categoryOrder',
      label: 'Category display order',
      list: true,
      ui: { itemProps: (item) => ({ label: item.slug || 'Choose a category' }) },
      fields: [
        {
          type: 'string',
          name: 'slug',
          label: 'Category',
          required: true,
          options: [
            'training',
            'distros',
            'public-clouds',
            'hosted-private-clouds',
            'remotely-managed-private-clouds',
            'consulting',
            'drivers',
          ],
        },
      ],
    },
    { type: 'string', name: 'title', label: 'Resources heading', required: true },
    {
      type: 'object',
      name: 'links',
      label: 'Global resource links',
      list: true,
      ui: { itemProps: (item) => ({ label: item.label || 'Resource' }) },
      fields: [
        { type: 'string', name: 'label', label: 'Label', required: true },
        { type: 'string', name: 'link', label: 'Destination', required: true },
      ],
    },
    { type: 'string', name: 'joinLabel', label: 'Listing call to action', required: true },
    { type: 'string', name: 'joinUrl', label: 'Listing destination', required: true },
    { type: 'image', name: 'compatibleImage', label: 'OpenStack Compatible logo' },
  ],
} satisfies Collection;
