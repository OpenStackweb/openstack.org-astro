const legacyMedia = new Set([
  'x-icon.svg',
  'bluesky_logo.svg',
  'mastodon.svg',
  'qrcode-for-gh-5cc38c749efd-1280.jpg',
]);
export function footerMedia(value) {
  if (!value) return '';
  if (legacyMedia.has(value)) return `/images/footer/${value}`;
  const url = new URL(value, 'https://www.openstack.org');
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (!value.startsWith('/') && !/^https?:\/\//.test(value))
  )
    throw new Error('Use an uploaded image or a website image URL.');
  return value;
}
export function validateFooterSubmission(content, { complete = false } = {}) {
  const list = (value, limit) => {
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > limit)
      throw new Error(`Use at most ${limit} entries.`);
    return value;
  };
  const link = (value) => {
    if (!value) return;
    const url = new URL(value, 'https://www.openstack.org');
    if (!['https:', 'http:', 'mailto:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Footer links must use website URLs, paths or mailto links.');
  };
  for (const column of list(content.columns, 12))
    for (const item of list(column.items, 50)) {
      if (complete && (!item.title?.trim() || !item.link?.trim()))
        throw new Error(
          'Every footer link needs text and a destination. Complete or remove the empty link.',
        );
      link(item.link);
    }
  for (const network of list(content.social?.networks, 30)) {
    link(network.clickBehaviour?.link);
    footerMedia(network.clickBehaviour?.openModal);
    footerMedia(network.rendering?.file);
    for (const attr of list(network.clickBehaviour?.attributes, 10))
      if (!['rel', 'target', 'title', 'aria-label'].includes(attr.attribute))
        throw new Error('Supported link attributes: rel, target, title and aria-label.');
  }
  return content;
}
