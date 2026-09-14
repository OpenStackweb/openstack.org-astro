import { safeMarketingUrl } from '../../../tina/marketing-validation.mjs';

// Preview incomplete forms without mutating the editor's draft. Publishing uses
// validateMarketing; draft-only fallback identities never become saved records.
export function prepareMarketing(content) {
  const sections = Array.isArray(content.sections) ? content.sections.filter(Boolean) : [];
  const uniqueId = (value, index, used, reserved) => {
    const valid = typeof value === 'string' && /^[a-z][a-z0-9_-]*$/.test(value) && !used.has(value);
    let id = valid ? value : `draft-${index}`;
    while (used.has(id) || (!valid && reserved.has(id))) id += '-draft';
    used.add(id);
    return id;
  };
  const sectionIds = new Set(sections.map(section => section.id).filter(Boolean));
  const usedSections = new Set();
  return {
    ...content,
    sections: sections.map((section, index) => {
      const usedCards = new Set();
      const cards = (Array.isArray(section.cards) ? section.cards : []).filter(Boolean);
      const cardIds = new Set(cards.map(card => card.id).filter(Boolean));
      const id = uniqueId(section.id, index, usedSections, sectionIds);
      return {
        ...section, id,
        cards: cards.map((card, cardIndex) => ({
          ...card,
          id: uniqueId(card.id, cardIndex, usedCards, cardIds),
          image: /^(?:https?:\/\/|\/(?!\/))/i.test(card.image || '') ? safeMarketingUrl(card.image) : '',
          action: card.action ? { ...card.action, url: safeMarketingUrl(card.action.url) } : null,
          videoId: /^[\w-]{11}$/.test(card.videoId || '') ? card.videoId : '',
          resources: (Array.isArray(card.resources) ? card.resources : []).filter(Boolean).map(resource => ({
            ...resource, url: safeMarketingUrl(resource.url),
          })),
        })),
      };
    }),
  };
}
