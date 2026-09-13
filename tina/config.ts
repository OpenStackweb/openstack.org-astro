import { defineConfig, InfoBox } from 'tinacms';
import { homepage, announcement } from './schema/site';
import { softwareOverview } from './schema/software';
import { editorial } from './schema/editorial';
import { archiveEvent } from './schema/archive-events';
import { SectionLinksField, validateSectionLinks } from './SectionLinksField';

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { loadCustomStore: async () => (await import('./r2-media-store')).R2MediaStore },
  schema: {
    collections: [
      homepage,
      announcement,
      {
        ...archiveEvent,
        fields: archiveEvent.fields.map(field => field.name === 'navigation'
          ? { ...field, ui: { component: SectionLinksField, validate: validateSectionLinks } } : field),
      },
      {
        ...editorial,
        fields: editorial.fields.map((field) => field.type === 'object' && field.name === 'sectionNavigation'
          ? { ...field, ui: { component: SectionLinksField, validate: validateSectionLinks } } : field),
      },
      {
        ...softwareOverview,
        fields: [
          {
            type: 'displayOnly', name: 'softwareAdmin',
            ui: { component: InfoBox({
              message: 'Software catalogue data is managed in the Software service. This development admin uses a separate login. The fields below edit only this page’s text, images and navigation.',
              links: [{ text: 'Open Software development admin ↗', url: 'https://software-api.devbranch.openstack.org/admin/' }],
            }) },
          },
          ...softwareOverview.fields!,
        ],
      },
      {
        name: 'proof',
        label: 'CMS proof — homepage content',
        path: 'src/lib/content/cms-proof',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/cms-proof/' },
        fields: [
          { type: 'string', name: 'title', label: 'Headline', isTitle: true, required: true },
          {
            type: 'string',
            name: 'description',
            label: 'Introduction',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'image', label: 'Hero image' },
          { type: 'string', name: 'imageAlt', label: 'Image description', required: true },
          { type: 'string', name: 'buttonLabel', label: 'Button text' },
          { type: 'string', name: 'buttonUrl', label: 'Button destination' },
          { type: 'image', name: 'download', label: 'Optional PDF download', accept: 'pdf' },
          {
            type: 'object',
            name: 'cards',
            label: 'Ways to use OpenStack',
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
              { type: 'string', name: 'link', label: 'Destination' },
            ],
          },
        ],
      },
    ],
  },
});
