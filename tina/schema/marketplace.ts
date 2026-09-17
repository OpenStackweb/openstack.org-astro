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
      type: 'object',
      name: 'helpLinks',
      label: 'Helpful resources',
      fields: [
        { type: 'string', name: 'title', label: 'Heading' },
        {
          type: 'object',
          name: 'links',
          label: 'Links',
          list: true,
          ui: { itemProps: (item) => ({ label: item.label || 'Resource' }) },
          fields: [
            { type: 'string', name: 'label', label: 'Link label', required: true },
            {
              type: 'string',
              name: 'link',
              label: 'Destination',
              required: true,
              ui: {
                validate: (value) => {
                  try {
                    if (
                      !['http:', 'https:', 'mailto:'].includes(
                        new URL(value || '', 'https://www.openstack.org').protocol,
                      )
                    )
                      return 'Use a page path, HTTPS link, or email link.';
                  } catch {
                    return 'Enter a valid destination.';
                  }
                },
              },
            },
          ],
        },
      ],
    },
    {
      type: 'string',
      name: 'contact',
      label: 'Contact call to action (inline Markdown)',
      ui: { component: 'textarea' },
    },
  ],
} satisfies Collection;
