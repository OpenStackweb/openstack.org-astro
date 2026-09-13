import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.TINA_BRANCH || 'cms/tina-proof',
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { loadCustomStore: async () => (await import('./r2-media-store')).R2MediaStore },
  schema: { collections: [{
    name: 'proof', label: 'CMS proof — homepage content',
    path: 'src/lib/content/cms-proof', format: 'json',
    ui: { allowedActions: { create: false, delete: false }, router: () => '/cms-proof/' },
    fields: [
      { type: 'string', name: 'title', label: 'Headline', isTitle: true, required: true },
      { type: 'string', name: 'description', label: 'Introduction', ui: { component: 'textarea' } },
      { type: 'image', name: 'image', label: 'Hero image' },
      { type: 'string', name: 'imageAlt', label: 'Image description', required: true },
      { type: 'string', name: 'buttonLabel', label: 'Button text' },
      { type: 'string', name: 'buttonUrl', label: 'Button destination' },
      { type: 'image', name: 'download', label: 'Optional PDF download', accept: 'pdf' },
      { type: 'object', name: 'cards', label: 'Ways to use OpenStack', list: true,
        ui: { itemProps: (item) => ({ label: item.title }) }, fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
          { type: 'string', name: 'link', label: 'Destination' },
        ] },
    ],
  }] },
});
