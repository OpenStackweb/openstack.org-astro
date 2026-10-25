import type { Collection } from 'tinacms';
import pages from '../archive-event-pages.json';

export const archiveEvent = {
  name: 'archiveEvent',
  label: 'Shared — archived event content',
  path: 'src/lib/content/archive-events',
  format: 'json',
  match: { include: `{${pages.map((page) => page.filename).join(',')}}` },
  ui: {
    allowedActions: { create: false, delete: false },
    router: ({ document }) => {
      const page = pages.find((page) => page.filename === document._sys.filename);
      return page ? `/cms-preview/event/${page.filename}/` : undefined;
    },
  },
  fields: [
    { type: 'string', name: 'eventId', required: true, ui: { component: () => null } },
    { type: 'string', name: 'title', label: 'Event name', isTitle: true, required: true },
    {
      type: 'string',
      name: 'introduction',
      label: 'Shared introduction (HTML or Markdown)',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'resources',
      label: 'Shared resources (HTML or Markdown)',
      ui: { component: 'textarea' },
    },
    {
      type: 'object',
      name: 'navigation',
      label: 'Shared event navigation',
      list: true,
      fields: [
        { type: 'string', name: 'label', label: 'Link text', required: true },
        { type: 'string', name: 'url', label: 'Destination', required: true },
      ],
    },
  ],
} satisfies Collection;
