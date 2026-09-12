const xml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]
  );

export function conferenceFeed(page) {
  const url = `https://www.openstack.org${page.path}`;
  const items = page.conference.updates
    .map(
      (item) =>
        `<item><title>${xml(item.title)}</title><link>${xml(`https://www.openstack.org${item.path || page.path}`)}</link><description>${xml(item.html.replace(/(href|src)="\/(?!\/)/g, '$1="https://www.openstack.org/'))}</description></item>`
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(page.title)}</title><link>${xml(url)}</link><description>Historical OpenStack event updates</description>${items}</channel></rss>`;
}
