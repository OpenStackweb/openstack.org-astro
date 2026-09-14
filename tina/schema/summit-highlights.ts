import type { TinaField } from 'tinacms';

const text = (name: string, label: string): TinaField => ({ type: 'string', name, label });
const copy = (name: string, label: string): TinaField => ({ type: 'string', name, label, ui: { component: 'textarea' } });
const image = (name: string, label: string): TinaField => ({ type: 'image', name, label });
const picture: TinaField[] = [image('image', 'Image'), text('credit', 'Image credit'), text('creditUrl', 'Credit link')];
const action: TinaField[] = [text('label', 'Button text'), text('url', 'Destination')];
const list = (name: string, label: string, fields: TinaField[]): TinaField => ({
  type: 'object', name, label, list: true, fields,
  ui: { itemProps: item => ({ label: item.title || item.label || 'Item' }) },
});

// Editorial snapshots from SummitHighlightsPage, not schedule/API records.
// Registered with the matching draft renderer and beforeSubmit validation.
export const summitHighlightsField: TinaField = {
  type: 'object', name: 'highlights', label: 'Summit highlights',
  description: 'Historical editorial selections and published statistics. Editing these does not change the Summit schedule, session catalogue or sponsor service.',
  fields: [
    text('eventTitle', 'Event name'), text('dates', 'Event dates'),
    { type: 'object', name: 'hero', label: 'Hero image', fields: picture },
    text('introTitle', 'Introduction heading'), copy('intro', 'Introduction'),
    copy('quote', 'Quote'), text('attribution', 'Quote attribution'), text('attributionUrl', 'Attribution link'),
    image('statisticsImage', 'Statistics background'),
    list('statistics', 'Published statistics', [text('label', 'Statistic label'), text('value', 'Published value')]),
    list('videos', 'Selected videos', [text('title', 'Video title'), text('youtubeId', 'YouTube video ID')]),
    list('keynotes', 'Keynote highlights', [text('title', 'Title'), text('day', 'Day'), image('image', 'Image'), image('thumbnail', 'Thumbnail'), copy('description', 'Description')]),
    list('photos', 'Photos', [text('title', 'Image description'), image('image', 'Photo')]),
    text('flickrUrl', 'Full photo album'),
    { type: 'object', name: 'release', label: 'Release announcement', fields: [text('title', 'Heading'), copy('description', 'Description'), image('image', 'Release image'), ...action] },
    { type: 'object', name: 'promotion', label: 'Related event promotion', fields: [...picture, text('title', 'Heading'), copy('description', 'Description'), ...action] },
    list('navigation', 'Section navigation', [text('label', 'Link text'), text('url', 'Destination')]),
  ],
};
