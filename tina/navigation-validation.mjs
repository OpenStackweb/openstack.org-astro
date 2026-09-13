export function validateNavigation(content) {
  function visit(items, depth = 0) {
    if (items == null) return;
    if (!Array.isArray(items) || items.length > 50 || depth > 2) throw new Error('Navigation supports three stored levels with up to 50 entries each.');
    for (const item of items) {
      if (item.link) {
        const url = new URL(item.link, 'https://www.openstack.org');
        if (!['https:', 'http:', 'mailto:'].includes(url.protocol) || url.username || url.password) throw new Error('Navigation destinations must be website paths or URLs.');
      }
      if (depth === 0 && (!item.title?.trim() || !item.link)) throw new Error('Each main navigation item needs a label and destination. Use # for a menu-only item.');
      if (depth > 0 && Boolean(item.title?.trim()) !== Boolean(item.link)) throw new Error('A dropdown entry needs both a label and destination, or neither for a divider.');
      visit(item.items, depth + 1);
    }
  }
  visit(content.items);
  return content;
}
