import type { Collection, TinaField } from 'tinacms';
import { validateSoftwareStart } from '../../src/lib/server/software-start.mjs';
const text = (name: string, label: string, required = false, multiline = false): TinaField => ({
  type: 'string',
  name,
  label,
  required,
  ...(multiline ? { ui: { component: 'textarea' } } : {}),
});
const object = (name: string, label: string, fields: TinaField[], list = false): TinaField => ({
  type: 'object',
  name,
  label,
  fields,
  ...(list
    ? {
        list: true,
        ui: {
          itemProps: (item: { title?: string; label?: string }) => ({
            label: item.title || item.label || 'New item',
          }),
        },
      }
    : {}),
});
const title = () => text('title', 'Heading', true);
const card = (): TinaField[] => [
  title(),
  text('content', 'Content (inline Markdown)', false, true),
  { type: 'image', name: 'logo', label: 'Logo' },
  object(
    'actions',
    'Actions',
    [text('label', 'Label', true), text('url', 'Destination', true)],
    true,
  ),
  object(
    'list',
    'Resource links',
    [text('title', 'Label', true), text('url', 'Destination', true)],
    true,
  ),
];
const section = (name: string, label: string) =>
  object(name, label, [title(), object('content', 'Cards', card(), true)]);
export const softwareStart = {
  name: 'softwareStart',
  label: 'Software — Get Started',
  path: 'src/lib/content',
  match: { include: 'software-start' },
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/software/start/',
    beforeSubmit: async ({ values }) => {
      validateSoftwareStart(values);
      return values;
    },
  },
  fields: [
    text('pageTitle', 'Search and browser title', true),
    title(),
    text('description', 'Search and sharing description', false, true),
    { type: 'boolean', name: 'showTrySection', label: 'Show Try OpenStack' },
    { type: 'boolean', name: 'showNextSteps', label: 'Show Next Steps' },
    section('trySection', 'Try OpenStack'),
    section('learn', 'Learn about OpenStack'),
    section('contribute', 'Contribute to OpenStack'),
    object('deploy', 'Deploy OpenStack', [
      title(),
      text('summary', 'Introduction (inline Markdown)', false, true),
      object('distributions', 'Distributions', card()),
      object('howto', 'How-to guides', card()),
      object('companies', 'Companies', card()),
      object('download', 'Download', card()),
      object('tools', 'Tools', card()),
    ]),
    section('nextSteps', 'Next steps'),
  ],
} satisfies Collection;
