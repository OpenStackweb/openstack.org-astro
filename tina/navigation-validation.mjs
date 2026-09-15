export function navigationDestinationError(value) {
  if (!value) return undefined; // Empty dropdown dividers are valid.
  try {
    const url = new URL(value, 'https://www.openstack.org');
    if (['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password) return undefined;
  } catch {
    // Return the same actionable error for malformed URLs and unsupported schemes.
  }
  return 'Use a website path, http/https URL, mailto link, or # for a menu-only item. Do not include a username or password.';
}

export function validateNavigation(content) {
  function visit(items, depth = 0) {
    if (items == null) return;
    if (!Array.isArray(items) || items.length > 50 || depth > 2) throw new Error('Navigation supports three stored levels with up to 50 entries each.');
    for (const item of items) {
      const destinationError = navigationDestinationError(item.link);
      if (destinationError) throw new Error(destinationError);
      if (depth === 0 && (!item.title?.trim() || !item.link)) throw new Error('Each main navigation item needs a label and destination. Use # for a menu-only item.');
      if (depth > 0 && Boolean(item.title?.trim()) !== Boolean(item.link)) throw new Error('A dropdown entry needs both a label and destination, or neither for a divider.');
      visit(item.items, depth + 1);
    }
  }
  visit(content.items);
  return content;
}
