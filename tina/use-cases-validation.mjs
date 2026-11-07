import { safeSoftwareLink } from '../src/lib/software/catalog.mjs';
export function validateUseCases(values) {
  for (const field of [
    'title',
    'pageTitle',
    'catalogueLabel',
    'viewsLabel',
    'searchLabel',
    'searchButton',
    'displayLabel',
    'gridLabel',
    'listLabel',
    'resultLabel',
    'resultsLabel',
    'clearLabel',
    'emptyLabel',
    'detailsLabel',
    'readMoreLabel',
    'surveyLabel',
  ]) {
    if (typeof values[field] !== 'string' || !values[field].trim())
      throw new Error(`${field} is required.`);
  }
  if (values.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(values.youtubeId))
    throw new Error('Enter an 11-character YouTube video ID, or clear it to remove the video.');
  if (
    values.hiddenStoryIds &&
    (!Array.isArray(values.hiddenStoryIds) || values.hiddenStoryIds.some((id) => !/^\d+$/.test(id)))
  )
    throw new Error('Hidden story IDs must be numeric catalogue identifiers.');
  const showHeroVideo = values.showHeroVideo !== false && Boolean(values.youtubeId);
  if (showHeroVideo) {
    for (const field of ['videoLabel', 'closeVideoLabel']) {
      if (typeof values[field] !== 'string' || !values[field].trim())
        throw new Error(`${field} is required when the hero video is shown.`);
    }
    if (!values.heroImage)
      throw new Error('Choose a background image for the hero video, or turn off Show hero video.');
  }
  if (
    (values.heroImage && !safeSoftwareLink(values.heroImage)) ||
    !safeSoftwareLink(values.surveyUrl)
  )
    throw new Error('Image and survey destinations must be safe URLs.');
  if (values.socialImage && !safeSoftwareLink(values.socialImage))
    throw new Error('Social image must be a safe URL.');
  const views = values.views;
  if (
    !Array.isArray(views) ||
    views.length !== 5 ||
    new Set(views.map((v) => v.value)).size !== 5 ||
    views.some(
      (v) =>
        !['date', 'name', 'location', 'industry', 'scale'].includes(v.value) ||
        typeof v.label !== 'string' ||
        !v.label.trim(),
    )
  )
    throw new Error('Keep each of the five browse modes exactly once, with a label.');
  return values;
}
