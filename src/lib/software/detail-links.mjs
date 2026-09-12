export function projectLinks(component, releaseSlug) {
  const team = String(component.project_team || component.slug || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!team || !/^[a-z0-9-]+$/.test(releaseSlug ?? '')) return {};
  const code = team.replace(/-/g, '_');
  return {
    project: `https://governance.openstack.org/tc/reference/projects/${team}.html`,
    source: `https://releases.openstack.org/teams/${code}.html#team-${releaseSlug}-${code}`,
    installation: `https://docs.openstack.org/project-install-guide/${releaseSlug}/`,
  };
}

export function projectVideo(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id)
    ? `https://www.youtube-nocookie.com/embed/${id}`
    : null;
}

export function capabilityGroups(tags = []) {
  const groups = new Map();
  for (const tag of tags) {
    const name = tag.category?.name || 'Other';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(tag);
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
