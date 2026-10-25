import type { Collection, TinaField } from 'tinacms';
import { storyRecords as records } from '../../src/lib/tina/story-records';
import { beforeHomepageSubmit } from '../home-release-validation.mjs';
import { PublishedReleaseField } from '../PublishedReleaseField';
const text = (name: string, label: string, multiline = false): TinaField => ({
  type: 'string',
  name,
  label,
  ...(multiline ? { ui: { component: 'textarea' } } : {}),
});
const image = (name: string, label: string): TinaField => ({ type: 'image', name, label });
const object = (name: string, label: string, fields: TinaField[]): TinaField => ({
  type: 'object',
  name,
  label,
  fields,
});
const imageFields = [image('src', 'Image'), text('alt', 'Image description')];
export const homepage: Collection = {
  name: 'homepage',
  label: 'Homepage',
  path: 'src/lib/content',
  match: { include: 'home' },
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/',
    beforeSubmit: beforeHomepageSubmit,
  },
  fields: [
    text('seoTitle', 'Search and browser title'),
    object('hero', 'Hero', [
      { type: 'string', name: 'title', label: 'Headline', required: true },
      text('text', 'Introduction', true),
      text('text2', 'Community message (Markdown)', true),
      object('image', 'Hero image', imageFields),
      text('cta_label', 'Button text'),
      text('cta_link', 'Button destination'),
    ]),
    object('diagram', 'Infrastructure and feature cards', [
      text('title', 'Heading'),
      text('text', 'Body (HTML or Markdown)', true),
      image('main_image', 'Diagram'),
      text('cta_title', 'Button title'),
      text('cta_label', 'Button text'),
      text('cta_link', 'Button destination'),
      {
        type: 'object',
        name: 'features',
        label: 'Feature cards',
        list: true,
        ui: {
          itemProps: (item) => ({ label: item.title || 'New feature' }),
          defaultItem: { display: true, title: 'New feature', text: '', link: '', image: '' },
        },
        fields: [
          text('title', 'Title'),
          text('text', 'Description', true),
          text('link', 'Destination'),
          image('image', 'Icon or image'),
          { type: 'boolean', name: 'display', label: 'Show this card' },
        ],
      },
    ]),
    object('latestRelease', 'Release promotion', [
      text('title', 'Heading'),
      object('image', 'Release image', imageFields),
      text('cta1_label', 'Primary button text'),
      {
        type: 'string',
        name: 'cta1_link',
        label: 'Latest release announcement',
        ui: { component: PublishedReleaseField },
      },
      text('cta2_label', 'Secondary button text'),
      text('cta2_link', 'Secondary destination'),
    ]),
    object('userStories', 'Featured stories', [
      text('title', 'Heading'),
      text('subtitle', 'Introduction', true),
      text('seeMoreLink', 'More stories destination'),
      {
        type: 'object',
        name: 'additionalStories',
        label: 'Additional editorial features',
        list: true,
        ui: { itemProps: (item) => ({ label: item.name || 'New feature' }) },
        fields: [
          text('name', 'Organization or case study'),
          text('description', 'Summary (HTML or Markdown)', true),
          text('link', 'Source or case study destination'),
          image('image', 'Image'),
          text('buttonText', 'Button text'),
        ],
      },
      {
        type: 'object',
        name: 'stories',
        label: 'Selected stories',
        list: true,
        ui: {
          itemProps: (item) => ({
            label: records[item.storyId as keyof typeof records]?.name || 'Select a story',
          }),
        },
        fields: [
          {
            type: 'string',
            name: 'storyId',
            label: 'Story',
            required: true,
            options: Object.entries(records).map(([value, row]) => ({ value, label: row.name })),
            description:
              'Select an existing service record. Its name and story content stay owned by the source service.',
          },
          image('image', 'Homepage image'),
          text('buttonText', 'Button text'),
        ],
      },
    ]),
    object('osfSection', 'Foundation', [
      object('image', 'Foundation logo', [...imageFields, text('link', 'Destination')]),
      text('text', 'Description (Markdown)', true),
    ]),
  ],
};
export const announcement: Collection = {
  name: 'announcement',
  label: 'Global — site announcement',
  path: 'src/lib/content',
  match: { include: 'announcement-banner' },
  format: 'json',
  ui: { global: true, allowedActions: { create: false, delete: false }, router: () => '/' },
  fields: [
    {
      type: 'boolean',
      name: 'display',
      label: 'Show announcement',
      description: 'Controls the homepage banner and the compact announcement on inner pages.',
    },
    text('title', 'Message'),
    image('logo', 'Homepage banner logo'),
    text('text', 'Additional text', true),
    text('cta_title', 'Link title'),
    text('cta_label', 'Link text'),
    text('cta_link', 'Link destination'),
  ],
};
