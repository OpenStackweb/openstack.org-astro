export function flatten(categories) {
  return categories.flatMap((row) => [
    ...(row.components ?? []),
    ...flatten(row.subcategories ?? []),
  ]);
}

export function catalogSections(root) {
  const children = [...(root.subcategories ?? [])].sort(
    (a, b) => (a.category.order ?? 0) - (b.category.order ?? 0),
  );
  if (root.category.hide_subnav || !children.length) return [root];
  return root.components?.length ? [{ ...root, subcategories: [] }, ...children] : children;
}

export function componentGroups(section, query = '', capability = '') {
  if (!section) return [];
  const search = query.trim().toLowerCase();
  const groups = [];
  function visit(node) {
    const children = [...(node.subcategories ?? [])].sort(
      (a, b) => (a.category.order ?? 0) - (b.category.order ?? 0),
    );
    if (node.components?.length || !children.length) {
      const components = (node.components ?? []).filter(
        (component) =>
          `${component.code_name} ${component.name}`.toLowerCase().includes(search) &&
          (!capability || component.capability_tags?.some((tag) => tag.name === capability)),
      );
      if ((!search && !capability) || components.length)
        groups.push({ category: node.category, components });
    }
    children.forEach(visit);
  }
  visit(section);
  return groups;
}

export function relatedComponent(catalog, reference) {
  return flatten(catalog).find(
    (component) =>
      (reference.id != null && component.id === reference.id) ||
      (reference.code_name &&
        component.code_name?.toLowerCase() === reference.code_name.toLowerCase()),
  );
}

export function safeSoftwareLink(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, 'https://www.openstack.org');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    return value.startsWith('/') && !value.startsWith('//') ? value : url.href;
  } catch {
    return null;
  }
}

// Category anchors and legacy capability-name anchors share the navigator URL.
export function catalogSelection(sections, hash = '') {
  let value = hash.replace(/^#/, '');
  try {
    value = decodeURIComponent(value);
  } catch {
    value = '';
  }
  const category = sections.find((section) => section.category.slug === value);
  if (category) return { selected: category.category.slug, capability: '' };
  const match = value && sections.find((section) => componentGroups(section, '', value).length);
  return {
    selected: (match || sections[0])?.category.slug || '',
    capability: match ? value : '',
  };
}
