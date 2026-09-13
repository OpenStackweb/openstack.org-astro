import { reviewHref } from '../legacy-routes.js';

export function prepareIndustry(input, render) {
  const text = (value = '') => {
    if (typeof value !== 'string' || value.length > 50000)
      throw new Error('Invalid industry content.');
    return value;
  };
  const link = (value) => {
    value = text(value);
    if (!value) return '';
    const url = new URL(value, 'https://www.openstack.org/');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Unsafe industry link.');
    return value.startsWith('#') ? value : reviewHref(url.href);
  };
  const list = (items = [], max = 100) => {
    if (!Array.isArray(items) || items.length > max) throw new Error('Invalid industry list.');
    return items;
  };
  const image = (value) => {
    value = text(value);
    if (
      value &&
      (!/^\/(?:assets|images|review\/media\/[a-f0-9]{40})\/[a-zA-Z0-9/._-]+$/.test(value) ||
        value.includes('..'))
    )
      throw new Error('Invalid industry image.');
    return value;
  };
  const ids = new Set();
  return {
    heroLayout: ['balanced', 'centered', 'resources'].includes(input.heroLayout) ? input.heroLayout : 'wide',
    layout: ['reports', 'case-study'].includes(input.layout) ? input.layout : 'standard',
    parentLabel: text(input.parentLabel),
    parentUrl: link(input.parentUrl),
    facts: list(input.facts, 10).map(text),
    heroHtml: render(text(input.heroBody)),
    sectionLabel: text(input.sectionLabel),
    heroNote: text(input.heroNote),
    heroActionLabel: text(input.heroActionLabel),
    heroActionUrl: link(input.heroActionUrl),
    photoCreditUrl: link(input.photoCreditUrl),
    sections: list(input.sections, 30).map((section) => {
      if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(section.id) || ids.has(section.id))
        throw new Error('Invalid or duplicate industry section ID.');
      ids.add(section.id);
      if (
        ![
          'prose',
          'cards',
          'stories',
          'topics',
          'quote',
          'logos',
          'split',
          'diagram',
          'rows',
        ].includes(section.kind)
      )
        throw new Error('Invalid industry section type.');
      if (!['white', 'muted', 'blue', 'gray', 'sky', 'ocean'].includes(section.tone))
        throw new Error('Invalid industry section background.');
      return {
        id: section.id,
        rows: list(section.rows, 20).map((row) => ({
          blocks: list(row.blocks, 12).map((block) => ({ html: render(text(block.body)) })),
        })),
        kind: section.kind,
        tone: section.tone,
        title: text(section.title),
        cardStyle: section.cardStyle === 'panel' ? 'panel' : 'plain',
        imageSide: section.imageSide === 'left' ? 'left' : 'right',
        image: image(section.image),
        mobileImage: image(section.mobileImage),
        imageAlt: text(section.imageAlt),
        portrait: image(section.portrait),
        attribution: text(section.attribution),
        columns: [2, 3, 4].includes(section.columns) ? section.columns : 4,
        actionLabel: text(section.actionLabel),
        actionUrl: link(section.actionUrl),
        html: render(text(section.body)),
        cards: list(section.cards).map((card) => ({
          title: text(card.title),
          icon: [
            'people',
            'sliders',
            'branches',
            'document',
            'briefcase',
            'code',
            'ticket',
          ].includes(card.icon)
            ? card.icon
            : '',
          html: render(text(card.body)),
          url: link(card.url),
          image: image(card.image),
        })),
        items: list(section.items).map(text),
      };
    }),
  };
}
