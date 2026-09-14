import { safeSoftwareLink } from '../src/lib/software/catalog.mjs';
export function validateUseCases(values) {
  for (const field of ['title', 'pageTitle', 'videoLabel', 'closeVideoLabel', 'catalogueLabel', 'viewsLabel', 'searchLabel', 'searchButton', 'displayLabel', 'gridLabel', 'listLabel', 'resultLabel', 'resultsLabel', 'clearLabel', 'emptyLabel', 'detailsLabel', 'readMoreLabel', 'surveyLabel']) {
    if (typeof values[field] !== 'string' || !values[field].trim()) throw new Error(`${field} is required.`);
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(values.youtubeId || '')) throw new Error('Enter an 11-character YouTube video ID.');
  for (const field of ['heroImage', 'surveyUrl']) if (!safeSoftwareLink(values[field])) throw new Error(`${field} must be a safe image or website URL.`);
  if (values.socialImage && !safeSoftwareLink(values.socialImage)) throw new Error('Social image must be a safe URL.');
  const views = values.views;
  if (!Array.isArray(views) || views.length !== 5 || new Set(views.map(v => v.value)).size !== 5 || views.some(v => !['date', 'name', 'location', 'industry', 'scale'].includes(v.value) || typeof v.label !== 'string' || !v.label.trim())) throw new Error('Keep each of the five browse modes exactly once, with a label.');
  return values;
}
