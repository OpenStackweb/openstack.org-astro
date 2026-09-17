import type { Collection, TinaField } from 'tinacms';
const text = (name: string, label: string, multiline = false): TinaField => ({
  type: 'string',
  name,
  label,
  ui: multiline ? { component: 'textarea' } : undefined,
});
const object = (name: string, label: string, fields: TinaField[], list = false): TinaField => ({
  type: 'object',
  name,
  label,
  fields,
  ...(list
    ? {
        list: true,
        ui: { itemProps: (item: { title?: string }) => ({ label: item.title || 'Item' }) },
      }
    : {}),
});
const action = () =>
  object('cta', 'Action', [
    text('label', 'Button label'),
    {
      type: 'string',
      name: 'href',
      label: 'Destination',
      required: true,
      ui: {
        validate: (value) => {
          try {
            if (
              !['https:', 'http:', 'mailto:'].includes(
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
  ]);
const card = (): TinaField[] => [
  text('title', 'Heading'),
  { type: 'image', name: 'icon', label: 'Icon' },
  text('body', 'Description', true),
  action(),
];
export const marketplaceHome = {
  name: 'marketplaceHome',
  label: 'Marketplace — landing page',
  path: 'src/lib/content',
  match: { include: 'marketplace-home' },
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/marketplace/' },
  fields: [
    text('title', 'Page heading'),
    text('pageTitle', 'Search and browser title'),
    text('description', 'Search and sharing description', true),
    object('deploymentChoices', 'Deployment choices', [
      text('title', 'Section heading'),
      text('description', 'Introduction'),
      object(
        'columns',
        'Deployment groups',
        [
          text('title', 'Group heading'),
          text('description', 'Introduction'),
          object('items', 'Choices', [text('id', 'Existing link anchor'), ...card()], true),
        ],
        true,
      ),
      object('hybridBlurb', 'Hybrid cloud', [
        text('title', 'Heading'),
        text('body', 'Description', true),
      ]),
    ]),
    object('designingAndTraining', 'Consulting and training', [
      text('title', 'Section heading'),
      object('columns', 'Cards', card(), true),
    ]),
    object('drivers', 'Driver catalogue', [
      text('title', 'Heading'),
      { type: 'image', name: 'icon', label: 'Icon' },
      text('description', 'Description', true),
      action(),
    ]),
    object('spotlightFAQ', 'Marketplace spotlight FAQ', [
      text('title', 'Question'),
      text('description', 'Answer (inline Markdown)', true),
    ]),
  ],
} satisfies Collection;
