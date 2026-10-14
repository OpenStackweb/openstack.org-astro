import registry from '../content/media.json' with { type: 'json' };
import { localMediaHref } from './media-assets.mjs';
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';
// Keep stored editorial URLs; resolve only verified website-owned media at render time.
export const useCaseImage = (value) => localMediaHref(value, registry) || value;

export function prepareUseCases(content) {
  if (typeof content.title !== 'string' || !content.title.trim())
    throw new Error('Use Cases title is required.');
  if (content.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(content.youtubeId))
    throw new Error('Use Cases video ID must be a YouTube ID.');
  const views = content.views?.map((view) => view.value);
  if (
    !Array.isArray(views) ||
    views.length !== 5 ||
    new Set(views).size !== 5 ||
    !views.every((view) => ['date', 'name', 'industry', 'location', 'scale'].includes(view))
  )
    throw new Error('Use Cases requires each of its five browse views.');
  const heroImage = safeSoftwareLink(content.heroImage);
  const surveyUrl = safeSoftwareLink(content.surveyUrl);
  if (!heroImage || !surveyUrl)
    throw new Error('Use Cases media and survey links must be safe URLs.');
  return {
    ...content,
    resultLabel: content.resultLabel || 'story',
    headerHtml: renderEditorialBody(content.headerText, '/use-cases/'),
    heroHtml: renderEditorialBody(content.heroText, '/use-cases/'),
    heroImage: useCaseImage(heroImage),
    surveyUrl: reviewHref(surveyUrl),
  };
}
