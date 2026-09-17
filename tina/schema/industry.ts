import type { TinaField } from 'tinacms';

const text = (name: string, label: string) => ({ type: 'string' as const, name, label });
const copy = (name: string, label: string): TinaField => ({ ...text(name, label), ui: { component: 'textarea' } });
const image = (name: string, label: string): TinaField => ({ type: 'image', name, label });
const choice = (name: string, label: string, options: string[]) => ({ type: 'string' as const, name, label, options });
const action: TinaField[] = [text('actionLabel', 'Action text'), text('actionUrl', 'Action destination')];

// Editorial layouts imported from SilverStripe templates. No service entities.
export const industryFields: TinaField[] = [
  { type: 'object', name: 'hero', label: 'Page hero', fields: [image('image', 'Hero image'), text('subtitle', 'Subtitle')] },
  { type: 'object', name: 'industry', label: 'Industry page layout and sections', fields: [
    choice('layout', 'Page layout', ['standard', 'reports', 'case-study']),
    choice('heroLayout', 'Hero layout', ['wide', 'balanced', 'centered', 'resources']),
    { type: 'boolean', name: 'heroOverlay', label: 'Overlay hero text' },
    { type: 'boolean', name: 'showBannerLinks', label: 'Show banner links', description: 'Shown by default when unset.' },
    text('heroEyebrow', 'Hero eyebrow'), copy('heroBody', 'Hero content (HTML or Markdown)'),
    text('sectionLabel', 'Section navigation label'), text('parentLabel', 'Parent page label'), text('parentUrl', 'Parent page destination'),
    { type: 'string', name: 'facts', label: 'Key facts', list: true },
    copy('heroNote', 'Hero note'), text('heroActionLabel', 'Hero action text'), text('heroActionUrl', 'Hero action destination'),
    text('photoCreditUrl', 'Photo credit destination'),
    { type: 'object', name: 'sections', label: 'Page sections', list: true,
      ui: { itemProps: item => ({ label: item.title || item.id || 'Section' }) },
      fields: [
        { type: 'string', name: 'id', label: 'Section anchor', required: true, description: 'Unique within this page; preserve existing anchors used by incoming links.' },
        { ...choice('kind', 'Section type', ['prose', 'cards', 'stories', 'topics', 'quote', 'logos', 'split', 'diagram', 'rows']), required: true },
        { ...choice('tone', 'Background', ['white', 'muted', 'blue', 'gray', 'sky', 'ocean', 'dark']), required: true },
        text('eyebrow', 'Text above section heading'), text('title', 'Section heading'), copy('body', 'Section content (HTML or Markdown)'),
        choice('cardStyle', 'Card style', ['plain', 'panel']), choice('imageSide', 'Image side', ['left', 'right']),
        image('image', 'Section image'), image('mobileImage', 'Mobile image'), text('imageAlt', 'Image description'),
        image('backgroundImage', 'Decorative section background'),
        image('portrait', 'Portrait'), text('attribution', 'Quote attribution'),
        { type: 'number', name: 'columns', label: 'Columns', ui: { validate: value => value == null || [2, 3, 4].includes(value) ? undefined : 'Choose 2, 3 or 4 columns.' } },
        ...action,
        { type: 'string', name: 'items', label: 'List items', list: true },
        { type: 'object', name: 'cards', label: 'Cards', list: true,
          ui: { itemProps: item => ({ label: item.title || 'Card' }) },
          fields: [text('title', 'Card heading'), copy('body', 'Card content (HTML or Markdown)'), text('url', 'Card destination'), image('image', 'Card image'),
            choice('icon', 'Card icon', ['', 'people', 'sliders', 'branches', 'document', 'play', 'briefcase', 'code', 'ticket'])] },
        { type: 'object', name: 'rows', label: 'Content rows', list: true, fields: [
          choice('layout', 'Row layout', ['equal', 'content-action']),
          { type: 'object', name: 'blocks', label: 'Row blocks', list: true, fields: [
            copy('body', 'Block content (HTML or Markdown)'), choice('icon', 'Block icon', ['', 'monitor', 'gears', 'sliders', 'server', 'branches', 'dollar', 'check', 'fork', 'briefcase']), ...action,
          ] },
        ] },
      ] },
  ] },
  { type: 'object', name: 'newsletter', label: 'Newsletter signup link', description: 'Opens the shared Foundation Emma signup page. Edit the heading, introduction and link text here.', fields: [
    text('title', 'Heading'), copy('description', 'Introduction'), text('buttonLabel', 'Button text'),
  ] },
  { type: 'object', name: 'scienceBook', label: 'Science book resources', fields: [
    text('title', 'Book heading'), copy('description', 'Book description'),
    { type: 'image', name: 'bookUrl', label: 'Book PDF', accept: 'pdf' },
    { type: 'image', name: 'printUrl', label: 'Print PDF', accept: 'pdf' },
    text('amazonUrl', 'Amazon destination'),
  ] },
];
