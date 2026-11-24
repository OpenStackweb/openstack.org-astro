import type { Collection, TinaField } from 'tinacms';
const text = (name: string, label: string): TinaField => ({
  type: 'string',
  name,
  label,
  required: true,
});
export const mascots = {
  name: 'mascots',
  label: 'Project mascots — page copy',
  path: 'src/lib/content',
  match: { include: 'project-mascots' },
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/project-mascots/' },
  fields: [
    text('title', 'Heading'),
    text('subtitle', 'Subtitle'),
    text('description', 'Search description'),
    { type: 'string', name: 'introduction', label: 'Introduction', ui: { component: 'textarea' } },
    text('galleryTitle', 'Gallery heading'),
    text('faqTitle', 'FAQ heading'),
    text('videoTitle', 'Video heading'),
    {
      type: 'object',
      name: 'videos',
      label: 'Videos',
      list: true,
      ui: { itemProps: (item) => ({ label: item.title }) },
      fields: [text('title', 'Title'), text('videoId', 'YouTube video ID')],
    },
    {
      type: 'object',
      name: 'faqs',
      label: 'Frequently asked questions',
      list: true,
      ui: { itemProps: (item) => ({ label: item.question }) },
      fields: [
        text('question', 'Question'),
        {
          type: 'string',
          name: 'answer',
          label: 'Answer',
          required: true,
          ui: { component: 'textarea' },
        },
      ],
    },
  ],
} satisfies Collection;
