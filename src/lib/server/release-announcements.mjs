import { renderEditorialBody } from './editorial.mjs';

export function releasePath(slug) {
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error('Release slug must contain lowercase words separated by hyphens.');
  return `/software/openstack-${slug}/`;
}

export function prepareReleaseAnnouncement(input) {
  const path = releasePath(input.slug);
  for (const field of ['title', 'description', 'contributorIntroduction']) {
    if (typeof input[field] !== 'string' || input[field].length > 2000)
      throw new Error(`Invalid release ${field}.`);
  }
  if (!input.title.trim()) throw new Error('Release title is required.');
  const contributors = input.contributors ?? [];
  if (
    !Array.isArray(contributors) ||
    contributors.length > 10000 ||
    contributors.some((name) => typeof name !== 'string' || name.length > 250)
  )
    throw new Error('Invalid release contributors.');
  return {
    ...input,
    kind: 'release',
    path,
    contributors,
    html: renderEditorialBody(input.body, path),
  };
}
