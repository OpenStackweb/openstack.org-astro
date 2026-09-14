import type { Collection, TinaField } from 'tinacms';
import { validateMarketing } from '../marketing-validation.mjs';
const text = (name: string, label: string, required = false): TinaField => ({ type: 'string', name, label, required });
const copy = (name: string, label: string): TinaField => ({ type: 'string', name, label, ui: { component: 'textarea' } });
export const marketing = {
  name: 'marketing', label: 'Marketing resources', path: 'src/lib/content',
  match: { include: 'marketing-resources' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/marketing/', beforeSubmit: ({ values }) => validateMarketing(values) },
  fields: [
    text('title', 'Page heading', true), copy('description', 'Search and sharing description'), copy('introduction', 'Introduction'),
    text('navigationLabel', 'Navigation accessible label', true), text('archiveLabel', 'Historical resources heading', true),
    text('watchLabel', 'Video action label', true), text('downloadLabel', 'Download label', true), text('unavailableLabel', 'Unavailable resource label', true),
    { type: 'object', name: 'sections', label: 'Sections', list: true,
      description: 'Preserve existing anchors for bookmarked links. Historical software resources are editorial files, not Software service catalogue records.',
      ui: { itemProps: item => ({ label: item.label || item.id || 'Section' }) }, fields: [
        text('id', 'Stable section anchor', true), text('label', 'Section label', true),
        { type: 'boolean', name: 'inNavigation', label: 'Show in main tabs' }, copy('introduction', 'Section introduction'),
        { type: 'object', name: 'cards', label: 'Cards', list: true,
          ui: {
            defaultItem: () => ({ id: `card-${crypto.randomUUID()}`, title: 'New card' }),
            itemProps: item => ({ label: item.title || 'Card' }),
          }, fields: [
            text('id', 'Stable card identifier', true), text('title', 'Card heading', true), copy('description', 'Card description'), text('group', 'Download group'),
            { type: 'image', name: 'image', label: 'Card image' }, text('imageAlt', 'Image description'),
            { type: 'object', name: 'action', label: 'Main action', fields: [text('label', 'Action label'), text('url', 'Destination')] },
            text('videoId', 'YouTube video ID'),
            { type: 'object', name: 'resources', label: 'Downloads and resources', list: true,
              ui: { itemProps: item => ({ label: item.label || 'Resource' }) },
              fields: [text('label', 'Resource label'), text('url', 'Destination'), text('group', 'Group'), copy('note', 'Unavailable resource explanation')] },
          ] },
      ] },
  ],
} satisfies Collection;
