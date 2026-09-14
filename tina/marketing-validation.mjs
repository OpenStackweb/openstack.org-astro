export const safeMarketingUrl = value => typeof value === 'string' &&
  /^(?:https?:\/\/|mailto:|\/(?!\/)|#)/i.test(value) && !/[\u0000-\u0020\\]/.test(value) ? value : '';

export function validateMarketing(values) {
  if (!values.title?.trim()) throw new Error('Marketing title is required.');
  const ids = new Set();
  for (const section of values.sections || []) {
    if (!/^[a-z][a-z0-9_-]*$/.test(section.id) || ids.has(section.id)) throw new Error('Section anchors must be unique lowercase identifiers.');
    ids.add(section.id);
    if (!section.label?.trim()) throw new Error('Section labels are required.');
    const cards = new Set();
    for (const card of section.cards || []) {
      if (!/^[a-z][a-z0-9_-]*$/.test(card.id) || cards.has(card.id)) throw new Error('Card identifiers must be unique within their section.');
      cards.add(card.id);
      if (!card.title?.trim()) throw new Error('Card headings are required.');
      if (card.videoId && !/^[\w-]{11}$/.test(card.videoId)) throw new Error('Use an eleven-character YouTube video ID.');
      for (const url of [card.image, card.action?.url, ...(card.resources || []).map(resource => resource.url)]) {
        if (url && !safeMarketingUrl(url)) throw new Error('Use a safe HTTP(S), email, local or anchor destination.');
      }
    }
  }
  if (!ids.has('get_involved')) throw new Error('Keep the default get_involved section.');
  return values;
}
