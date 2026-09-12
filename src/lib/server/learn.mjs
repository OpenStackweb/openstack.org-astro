import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareLearn(content) {
  const text = (value) => {
    if (typeof value !== 'string' || !value.trim() || value.length > 5000)
      throw new Error('Learn copy is required.');
    return value;
  };
  const link = (value) => {
    const safe = safeSoftwareLink(value);
    if (!safe) throw new Error('Learn links require safe HTTP(S) URLs.');
    return reviewHref(safe);
  };
  if (!Array.isArray(content.cards) || content.cards.length > 50)
    throw new Error('Invalid Learn cards.');
  const seen = new Set();
  return {
    title: text(content.title),
    subtitle: text(content.subtitle),
    intro: text(content.intro),
    heroImage: link(content.heroImage),
    cards: content.cards.map((card) => {
      if (!/^[a-z0-9-]+$/.test(card.id) || seen.has(card.id))
        throw new Error('Learn card IDs must be unique.');
      seen.add(card.id);
      return {
        id: card.id,
        title: text(card.title),
        description: text(card.description),
        image: link(card.image),
        imageAlt: text(card.imageAlt),
        tallImage: card.tallImage === true,
        link: link(card.link),
        linkLabel: text(card.linkLabel),
      };
    }),
  };
}
