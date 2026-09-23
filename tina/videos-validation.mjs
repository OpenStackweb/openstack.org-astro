export function validateVideoPage(values) {
  for (const field of [
    'title',
    'description',
    'recentTitle',
    'popularTitle',
    'popularDescription',
    'channelLabel',
    'unavailableMessage',
  ]) {
    if (typeof values[field] !== 'string' || !values[field].trim())
      throw new Error(`${field} is required`);
  }
  for (const field of ['includeIds', 'excludeIds']) {
    const ids = values[field] || [];
    if (
      !Array.isArray(ids) ||
      ids.length > 100 ||
      ids.some((id) => !/^[A-Za-z0-9_-]{11}$/.test(id)) ||
      new Set(ids).size !== ids.length
    )
      throw new Error(`${field} must contain unique YouTube video IDs (up to 100)`);
  }
  if ((values.includeIds || []).some((id) => (values.excludeIds || []).includes(id)))
    throw new Error('A video cannot be both included and excluded');
  return values;
}
