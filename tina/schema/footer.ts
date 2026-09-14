import type { Collection, TinaField } from 'tinacms';
import { validateFooterSubmission } from '../footer-validation.mjs';
const text = (name: string, label: string, multiline = false): TinaField => ({ type: 'string', name, label, ...(multiline ? { ui: { component: 'textarea' } } : {}) });
const display: TinaField = { type: 'boolean', name: 'display', label: 'Display' };
export const footer: Collection = {
  name: 'footer', label: 'Global — footer and newsletter', path: 'src/lib/content', match: { include: 'footer' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/cms-preview/footer/', beforeSubmit: ({ values }) => validateFooterSubmission(values, { complete: true }) },
  fields: [
    { type: 'object', name: 'newsletter', label: 'Newsletter promotion', fields: [display, text('title', 'Heading'), text('description', 'Introduction', true), text('submitLabel', 'Subscribe button text')] },
    { type: 'object', name: 'columns', label: 'Link columns', list: true, ui: { itemProps: item => ({ label: item.title || 'Column' }) }, fields: [text('title', 'Column heading'), display,
      { type: 'object', name: 'items', label: 'Links', list: true, ui: { itemProps: item => ({ label: item.title || 'Link' }) }, fields: [{ type: 'string', name: 'title', label: 'Link text', required: true, ui: { validate: (value: string | undefined) => value?.trim() ? undefined : 'Required' } }, { type: 'string', name: 'link', label: 'Destination', required: true, ui: { validate: (value: string | undefined) => value?.trim() ? undefined : 'Required' } }] },
    ] },
    { type: 'object', name: 'social', label: 'Social links', fields: [display, text('title', 'Heading'),
      { type: 'object', name: 'networks', label: 'Networks', list: true, ui: { itemProps: item => ({ label: item.title || 'Network' }) }, fields: [display, text('title', 'Network label'),
        { type: 'object', name: 'clickBehaviour', label: 'Link or QR action', fields: [text('link', 'Destination'),
          { type: 'image', name: 'openModal', label: 'QR dialog image', description: 'A dialog image takes precedence over a link.' },
          { type: 'object', name: 'attributes', label: 'Link attributes', list: true, fields: [
            { type: 'string', name: 'attribute', label: 'Attribute', options: ['rel', 'target', 'title', 'aria-label'] }, text('value', 'Value'),
          ] },
        ] },
        { type: 'object', name: 'rendering', label: 'Network image', fields: [
          { type: 'image', name: 'file', label: 'Icon image' },
          { type: 'string', name: 'icon', label: 'Legacy icon identifier', ui: { component: () => null } },
        ] },
      ] },
    ] },
    { type: 'object', name: 'credit', label: 'Credits', fields: [display, text('content', 'Credits (HTML or Markdown)', true)] },
  ],
};
