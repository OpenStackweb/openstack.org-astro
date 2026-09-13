import type { Collection, TinaField } from 'tinacms';

const text = (name: string, label: string, multiline = false): TinaField => ({
  type: 'string', name, label,
  ...(multiline ? { ui: { component: 'textarea' } } : {}),
});
const object = (name: string, label: string, fields: TinaField[]): TinaField => ({
  type: 'object', name, label, fields,
});
const link = () => object('link', 'Link', [text('title', 'Label'), text('url', 'Destination')]);
const introduction = (name: string, label: string) => object(name, label, [
  text('title', 'Heading'), text('abstract', 'Introduction (Markdown)', true), link(),
  object('image', 'Image', [
    { type: 'image', name: 'src', label: 'Image' }, text('alt', 'Image description'),
  ]),
]);
const action = (name: string, label: string) => object(name, label, [
  text('title', 'Heading'), text('abstract', 'Description (Markdown)', true),
  text('button_text', 'Button label'), text('button_link', 'Button destination'),
  text('step_number', 'Step number'),
]);

// Only the landing page's editorial copy and presentation belong in Git.
// Releases, components and catalogue records remain in the Software service.
export const softwareOverview = {
  name: 'softwareOverview', label: 'Software — page content and admin',
  path: 'src/lib/content', match: { include: 'software-overview' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/software/' },
  fields: [
    text('pageTitle', 'Page title'),
    introduction('introComponent', 'What is OpenStack?'),
    introduction('landscapeComponent', 'OpenStack landscape'),
    object('browseProjectComponent', 'Browse links', [
      text('sectionTitle', 'Section heading'),
      {
        type: 'object', name: 'projects', label: 'Navigation cards', list: true,
        description: 'Editorial links to catalogue sections. These are not software component records.',
        ui: { itemProps: (item) => ({ label: item.title || 'Navigation card' }) },
        fields: [text('title', 'Title'), { type: 'image', name: 'icon', label: 'Icon' },
          text('abstract', 'Description (Markdown)', true), link()],
      },
    ]),
    action('sampleConfigurationSection', 'Case studies link'),
    action('marketplaceSection', 'Marketplace link'),
  ],
} satisfies Collection;
