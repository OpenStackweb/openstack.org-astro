// Highlights are editorial records, not a recalculation of the schedule API.
export function validateHighlightsStatistics(value) {
  if (value == null) return;
  if (!Array.isArray(value) || value.length > 20) return 'Use at most 20 published statistics.';
  for (const [index, row] of value.entries()) {
    if (!row || typeof row.label !== 'string' || !row.label.trim() ||
        typeof row.value !== 'string' || !row.value.trim()) {
      return `Statistic ${index + 1} needs a label and a published value.`;
    }
    if (row.label.length > 3000 || row.value.length > 3000)
      return `Statistic ${index + 1} label and value must each be at most 3,000 characters.`;
  }
}

export function prepareHighlightsContent(input, render, { draft = false, resolveHref = value => value } = {}) {
  if (!draft) {
    const statisticsError = validateHighlightsStatistics(input.statistics);
    if (statisticsError) throw new Error(statisticsError);
  }
  const text = (value = '', max = 3000) => {
    if (typeof value !== 'string' || value.length > max) {
      if (draft) return '';
      throw new Error('Invalid Highlights text.');
    }
    return value.trim();
  };
  const link = (value = '') => {
    const raw = text(value);
    if (!raw) return '';
    let url;
    try { url = new URL(raw, 'https://www.openstack.org/'); } catch {
      if (draft) return '';
      throw new Error('Unsafe Highlights link.');
    }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      if (draft) return '';
      throw new Error('Unsafe Highlights link.');
    }
    return resolveHref(url.href);
  };
  const image = (value = '') => {
    const raw = text(value);
    if (
      raw &&
      (!/^(?:\/(?:assets|images|review\/media\/[a-f0-9]{40})\/[a-zA-Z0-9/._-]+|\/cms-media\/[a-f0-9]{64}\.(?:png|jpg|webp))$/.test(raw) ||
        raw.includes('..'))
    ) {
      if (draft) return '';
      throw new Error('Invalid Highlights image.');
    }
    return raw;
  };
  const rich = (value) => render(text(value, 50000));
  const list = (value, limit, prepare) => {
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > limit) {
      if (draft) return [];
      throw new Error('Invalid Highlights list.');
    }
    return (draft ? value.filter(item => item && typeof item === 'object') : value).map(prepare).filter(Boolean);
  };
  const picture = (value = {}) => ({
    image: image(value.image),
    credit: text(value.credit),
    creditUrl: link(value.creditUrl),
  });
  const release = input.release || {};
  const promotion = input.promotion || {};
  return {
    statisticsImage: image(input.statisticsImage),
    eventTitle: text(input.eventTitle),
    dates: text(input.dates),
    hero: picture(input.hero || {}),
    introTitle: text(input.introTitle),
    introHtml: rich(input.intro),
    quoteHtml: rich(input.quote),
    attribution: text(input.attribution),
    attributionUrl: link(input.attributionUrl),
    statistics: list(input.statistics, 20, (item) => ({
      label: text(item.label),
      value: text(item.value),
    })),
    videos: list(input.videos, 20, (item) => {
      if (!/^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId)) {
        if (draft) return null;
        throw new Error('Invalid Highlights video ID.');
      }
      return { youtubeId: item.youtubeId, title: text(item.title) || 'Summit video' };
    }),
    keynotes: list(input.keynotes, 100, (item) => ({
      title: text(item.title),
      day: text(item.day),
      image: image(item.image),
      thumbnail: image(item.thumbnail),
      html: rich(item.description),
    })),
    photos: list(input.photos, 100, (item) => ({
      title: text(item.title),
      image: image(item.image),
    })),
    flickrUrl: link(input.flickrUrl),
    release: {
      title: text(release.title),
      html: rich(release.description),
      image: image(release.image),
      label: text(release.label),
      url: link(release.url),
    },
    promotion: {
      ...picture(promotion),
      title: text(promotion.title),
      html: rich(promotion.description),
      label: text(promotion.label),
      url: link(promotion.url),
    },
    navigation: list(input.navigation, 20, (item) => ({
      label: text(item.label),
      url: link(item.url),
    })),
  };
}

export function validateHighlights(input) {
  if (input) prepareHighlightsContent(input, value => value);
  return input;
}
