/** Public, anonymous menu contract shared with the standalone blog. */
export const joinNavigation = {
  title: 'Join',
  link: '#',
  items: [
    { title: 'Join the community', link: '/community/' },
    { title: 'Join the Foundation', link: 'https://openinfra.dev/join/' },
  ],
};

export function publicNavigation(source) {
  const convert = (item, depth = 0) => {
    if (item.display === false || item.requiresAuth) return null;
    if (!item.title && !item.link) return { separator: true };
    if (typeof item.title !== 'string') return null;
    let link = '';
    if (item.link && item.link !== '#') {
      try {
        const url = new URL(item.link, 'https://www.openstack.org');
        if (!['https:', 'http:'].includes(url.protocol)) return null;
        link = url.href;
      } catch {
        return null;
      }
    }
    const items =
      depth === 0 ? (item.items ?? []).map((child) => convert(child, 1)).filter(Boolean) : [];
    return link || items.length
      ? { title: item.title.trim(), link, ...(items.length ? { items } : {}) }
      : null;
  };
  return {
    version: 1,
    items: [...(source.items ?? []), joinNavigation].map((item) => convert(item)).filter(Boolean),
  };
}
