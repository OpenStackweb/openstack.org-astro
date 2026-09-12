export function sampleSelection(types, hash) {
  const [slug, id] = hash.replace(/^#/, '').split('/');
  const type =
    types.find((item) => item.slug === slug) ?? types.find((item) => item.is_default) ?? types[0];
  const configuration =
    type?.configurations.find((item) => String(item.id) === id) ??
    type?.configurations.find((item) => item.is_default) ??
    type?.configurations[0];
  return { type, configuration };
}

export function sortOptionalComponents(components, metric, direction) {
  const key = ['maturity_points', 'age', 'adoption'].includes(metric) ? metric : 'code_name';
  return [...components].sort((a, b) => {
    if (a[key] == null) return b[key] == null ? 0 : 1;
    if (b[key] == null) return -1;
    const comparison = key === 'code_name' ? a[key].localeCompare(b[key]) : a[key] - b[key];
    return direction === 'desc' ? -comparison : comparison;
  });
}
