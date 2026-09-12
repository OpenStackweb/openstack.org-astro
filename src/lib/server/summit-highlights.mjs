import { reviewHref } from '../legacy-routes.js';

// Highlights are editorial records, not a recalculation of the schedule API.
export function prepareHighlights(input, render) {
  const text = (value = '', max = 3000) => {
    if (typeof value !== 'string' || value.length > max)
      throw new Error('Invalid Highlights text.');
    return value.trim();
  };
  const link = (value = '') => {
    const raw = text(value);
    if (!raw) return '';
    const url = new URL(raw, 'https://www.openstack.org/');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Unsafe Highlights link.');
    return reviewHref(url.href);
  };
  const image = (value = '') => {
    const raw = text(value);
    if (
      raw &&
      (!/^\/(?:assets|images|review\/media\/[a-f0-9]{40})\/[a-zA-Z0-9/._-]+$/.test(raw) ||
        raw.includes('..'))
    )
      throw new Error('Invalid Highlights image.');
    return raw;
  };
  const rich = (value) => render(text(value, 50000));
  const list = (value, limit, prepare) => {
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > limit) throw new Error('Invalid Highlights list.');
    return value.map(prepare);
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
    hero: picture(input.hero),
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
      if (!/^[a-zA-Z0-9_-]{11}$/.test(item.youtubeId))
        throw new Error('Invalid Highlights video ID.');
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
