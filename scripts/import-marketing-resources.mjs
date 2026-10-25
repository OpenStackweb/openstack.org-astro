// Import only the public MarketingPage rendering supplied for review.
// This does not export unpublished/unassigned database records or fetch assets.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { parseDocument, DomUtils as D } from 'htmlparser2';

const [input, output] = process.argv.slice(2);
assert.ok(input && output, 'Provide reviewed public HTML and a private output JSON path');
const doc = parseDocument(await readFile(input, 'utf8'));
// Cloudflare rewrites public email addresses in the HTML response. Restore the
// same address its browser script displays; never import its encoded proxy URL.
for (const anchor of D.findAll((node) => node.name === 'a', doc.children)) {
  const encoded = anchor.attribs.href?.match(/^\/cdn-cgi\/l\/email-protection#([a-f0-9]+)$/i)?.[1];
  if (!encoded || encoded.length % 2 || encoded.length < 4) continue;
  const bytes = Buffer.from(encoded, 'hex');
  const email = Buffer.from(bytes.subarray(1).map((byte) => byte ^ bytes[0])).toString('utf8');
  assert.match(email, /^[^\s<>"@]+@[^\s<>"@]+\.[^\s<>"@]+$/);
  anchor.attribs.href = `mailto:${email}`;
  for (const span of D.findAll((node) => !!node.attribs?.['data-cfemail'], anchor.children)) {
    D.replaceElement(span, parseDocument(email).children[0]);
  }
}
const find = (root, predicate) => D.findAll(predicate, root.children || []);
const cls = (node, name) => (node.attribs?.class || '').split(/\s+/).includes(name);
const byClass = (root, name) => find(root, (node) => cls(node, name));
const text = (node) => (node ? D.textContent(node).replace(/\s+/g, ' ').trim() : '');
const html = (node) => (node ? D.getInnerHTML(node).replace(/^\s+/gm, '').trim() : '');
const first = (root, tag) => find(root, (node) => node.name === tag)[0];
const image = (root) => {
  const img = first(root, 'img');
  return img ? { image: img.attribs.src, imageAlt: img.attribs.alt || '' } : {};
};
const link = (node) => ({ label: text(node), url: node?.attribs.href || '' });
const groupFor = (node, panel) => {
  for (let parent = node.parent; parent && parent !== panel; parent = parent.parent) {
    if (cls(parent, 'modal')) return text(first(parent, 'h4')).replace(/\s*\(\d+\)$/, '');
  }
  return '';
};
const panels = ['get_involved', 'events', 'promote_product', 'collateral', 'software', 'graphics'];
const labels = [
  'Get Involved',
  'Navigating Events',
  'Promote Your Product',
  'Collateral',
  'Software release resources',
  'Graphics',
];
const content = {
  title: text(first(doc, 'h1')),
  introduction: html(byClass(doc, 'page-descr')[0]),
  sections: panels.map((id, index) => {
    const panel = find(doc, (node) => node.attribs?.id === id)[0];
    assert.ok(panel, `Missing public panel ${id}`);
    const section = {
      id,
      label: labels[index],
      inNavigation: index < 3,
      introduction: html(byClass(panel, 'tab-header')[0]),
      cards: [],
    };
    if (id === 'get_involved') {
      const container = byClass(panel, 'container')[0];
      section.introduction = html(container);
    } else if (['events', 'promote_product'].includes(id)) {
      section.cards = byClass(panel, 'br-block').map((card, i) => ({
        id: `${id}-${i + 1}`,
        title: text(first(card, 'h3')),
        description: html(byClass(card, 'small-descr')[0]),
        ...image(card.parent),
        action: link(byClass(card, 'red-button')[0]),
      }));
    } else if (id === 'software') {
      section.cards = byClass(panel, 'brt1').map((card, i) => {
        const frame = first(card, 'iframe');
        const downloads = find(
          card,
          (node) =>
            node.name === 'a' && cls(node, 'download') && !node.attribs.href?.startsWith('#'),
        );
        return {
          id: `release-${i + 1}`,
          title: text(first(card, 'h3')),
          description: html(byClass(card, 'small-descr')[0]),
          ...image(card),
          action: link(byClass(card, 'view-more')[0]),
          videoId: frame?.attribs.src?.match(/\/embed\/([\w-]{11})/)?.[1] || '',
          resources: downloads.map((node) => ({
            ...link(node),
            label: text(first(node.parent, 'span')) || text(node),
          })),
        };
      });
    } else if (id === 'collateral') {
      section.cards = byClass(panel, 'br-block').map((card, i) => ({
        id: `collateral-${i + 1}`,
        title: text(first(card, 'h3')),
        description: html(byClass(card, 'small-descr')[0]),
        ...image(card.parent),
        resources: find(
          card,
          (node) =>
            node.name === 'a' && cls(node, 'download') && !node.attribs.href?.startsWith('#'),
        ).map((node) => {
          let row = node.parent;
          while (row && !cls(row, 'item_row')) row = row.parent;
          return {
            ...link(node),
            label: text(byClass(row || card, 'left-info')[0]) || text(node),
            group: groupFor(node, panel),
          };
        }),
      }));
    } else {
      // Leaf download items include grouped modal children, excluding the group launcher.
      section.cards = find(panel, (node) => node.name === 'li')
        .filter((node) =>
          (node.children || []).some(
            (child) =>
              child.name === 'a' &&
              cls(child, 'download') &&
              child.attribs.href &&
              !child.attribs.href.startsWith('#'),
          ),
        )
        .map((card, i) => {
          return {
            id: `graphic-${i + 1}`,
            title: text(first(card, 'p')),
            group: groupFor(card, panel),
            ...image(card),
            resources: card.children
              .filter((node) => node.name === 'a' && cls(node, 'download'))
              .map(link),
          };
        });
    }
    return section;
  }),
};
assert.equal(content.title, 'Marketing Resources');
// Catch changed source markup rather than silently dropping this reviewed cohort.
assert.deepEqual(
  content.sections.map((section) => section.cards.length),
  [0, 3, 3, 9, 10, 7],
);
for (const section of content.sections)
  for (const card of section.cards) {
    assert.ok(card.title && card.image, `Incomplete marketing card ${card.id}`);
  }
await writeFile(output, JSON.stringify(content, null, 2) + '\n');
console.log(
  content.sections.map(({ id, cards }) => ({
    id,
    cards: cards.length,
    resources: cards.reduce((n, card) => n + (card.resources?.length || 0), 0),
  })),
);
