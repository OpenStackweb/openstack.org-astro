import type { Collection } from 'tinacms';
import { validateVideoPage } from '../videos-validation.mjs';
export const videos: Collection = {
  name: 'videos',
  label: 'Videos — page and selection',
  path: 'src/lib/content',
  match: { include: 'videos' },
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/videos/',
    beforeSubmit: ({ values }) => validateVideoPage(values),
  },
  fields: [
    { type: 'string', name: 'title', label: 'Page heading', isTitle: true, required: true },
    {
      type: 'string',
      name: 'description',
      label: 'Introduction',
      required: true,
      ui: { component: 'textarea' },
    },
    { type: 'string', name: 'recentTitle', label: 'Recent videos heading', required: true },
    { type: 'string', name: 'popularTitle', label: 'Popular videos heading', required: true },
    {
      type: 'string',
      name: 'popularDescription',
      label: 'Popular selection explanation',
      required: true,
      ui: { component: 'textarea' },
    },
    { type: 'string', name: 'channelLabel', label: 'YouTube channel link text', required: true },
    {
      type: 'string',
      name: 'unavailableMessage',
      label: 'Message when the feed is unavailable',
      required: true,
    },
    {
      type: 'string',
      name: 'includeIds',
      label: 'Optional inclusion overrides',
      list: true,
      description:
        'YouTube video IDs, not URLs. Only public videos from the Foundation channel can qualify. Metadata appears after the next daily refresh. Inclusion permits ranking; it does not pin a video.',
    },
    {
      type: 'string',
      name: 'excludeIds',
      label: 'Optional exclusions',
      list: true,
      description:
        'YouTube video IDs to omit. Exclusions take effect when the editorial change is published. No routine curation is required.',
    },
  ],
};
