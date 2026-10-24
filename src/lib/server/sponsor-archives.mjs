import { reviewHref } from '../legacy-routes.js';

// These records describe published historical events, not active sponsorship sales.
export function prepareSponsors(input, renderBody) {
  const text = (value, maximum = 250) => {
    if (typeof value !== 'string' || !value.trim() || value.length > maximum)
      throw new Error('Invalid sponsor archive text.');
    return value.trim();
  };
  const list = (value, maximum) => {
    if (!Array.isArray(value) || value.length > maximum)
      throw new Error('Invalid sponsor archive list.');
    return value;
  };
  const image = (value) => {
    if (
      typeof value !== 'string' ||
      !value.startsWith('/assets/') ||
      /[\\\\?#\x00-\x20]/.test(value) ||
      value.split('/').some((part) => part === '..' || part === '.')
    )
      throw new Error('Sponsor images must use a published asset path.');
    return value;
  };
  const groups = list(input.groups, 30).map((group) => {
    if (![2, 3, 4, 6].includes(group.columns)) throw new Error('Invalid sponsor columns.');
    return {
      title: text(group.title),
      columns: group.columns,
      sponsors: list(group.sponsors, 200).map((sponsor) => {
        const url = sponsor.url ? new URL(sponsor.url) : null;
        if (url && (!['https:', 'http:'].includes(url.protocol) || url.username || url.password))
          throw new Error('Invalid sponsor destination.');
        return {
          name: text(sponsor.name),
          url: url ? reviewHref(url.href) : '',
          image: sponsor.image ? image(sponsor.image) : '',
        };
      }),
    };
  });
  if (!input.audience) return { groups };
  const audience = input.audience;
  return {
    groups,
    audience: {
      title: text(audience.title),
      html: renderBody(audience.body),
      coverImage: audience.coverImage ? image(audience.coverImage) : '',
      metrics: list(audience.metrics, 20).map((item) => ({
        label: text(item.label),
        value: text(item.value),
      })),
      charts: list(audience.charts, 10).map((chart) => {
        const items = list(chart.items, 30).map((item) => {
          if (
            !Number.isFinite(item.value) ||
            item.value < 0 ||
            item.value > 100 ||
            !/^#[0-9a-f]{6}$/i.test(item.color)
          )
            throw new Error('Invalid sponsor chart value or color.');
          return { label: text(item.label), value: item.value, color: item.color };
        });
        const total = items.reduce((sum, item) => sum + item.value, 0);
        if (!total) throw new Error('Sponsor chart must contain data.');
        let offset = 0;
        const stops = items.map((item) => {
          const start = offset;
          offset += (item.value / total) * 100;
          return `${item.color} ${start}% ${offset}%`;
        });
        return {
          title: text(chart.title),
          items,
          background: `conic-gradient(${stops.join(', ')})`,
        };
      }),
    },
  };
}
