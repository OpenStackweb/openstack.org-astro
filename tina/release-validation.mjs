export function releaseSlugError(value, initialValue) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    return 'Use lowercase words separated by hyphens.';
  if (initialValue && value !== initialValue)
    return 'Keep the saved release slug unchanged to preserve existing links. Restore its original value to continue.';
}

export function validateReleaseAnnouncement(values, originalSlug) {
  if (!values || typeof values !== 'object') throw new Error('Release announcement is required.');
  if (typeof values.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug))
    throw new Error('Use a lowercase release slug with hyphens between words.');
  if (originalSlug && values.slug !== originalSlug)
    throw new Error('Keep the published release slug unchanged to preserve existing links.');
  for (const field of ['title', 'description', 'contributorIntroduction']) {
    if (typeof values[field] !== 'string' || values[field].length > 2000)
      throw new Error(`Invalid announcement ${field}.`);
  }
  if (!values.title.trim()) throw new Error('A release headline is required.');
  if (typeof values.body !== 'string' || values.body.length > 500000)
    throw new Error('Announcement content must be text under 500,000 characters.');
  const contributors = values.contributors ?? [];
  if (
    !Array.isArray(contributors) ||
    contributors.length > 10000 ||
    contributors.some((name) => typeof name !== 'string' || name.length > 250)
  )
    throw new Error('Contributor names must be text, at most 250 characters each.');
  return values;
}
