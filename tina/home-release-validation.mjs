import { cmsResponse } from './cms-response.mjs';
import { latestReleasePath } from '../src/lib/server/latest-release.mjs';

export async function publishedReleaseChoices(fetcher = fetch) {
  const response = await fetcher('/api/cms/releases', {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  const choices = await cmsResponse(
    response,
    'Unable to load published announcements. Try again after the website deployment finishes.',
  );
  if (
    !Array.isArray(choices) ||
    !choices.length ||
    choices.some(
      (row) =>
        !row ||
        typeof row.slug !== 'string' ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) ||
        typeof row.title !== 'string' ||
        !row.title.trim() ||
        row.title.length > 2000 ||
        row.path !== `/software/openstack-${row.slug}/`,
    ) ||
    new Set(choices.map((row) => row.slug)).size !== choices.length
  )
    throw new Error('The published announcement list is invalid. Reload the editor before saving.');
  return choices;
}

export function validateHomepageRelease(values, choices) {
  latestReleasePath(
    values?.latestRelease?.cta1_link,
    choices.map((row) => row.slug),
  );
  return values;
}

export async function beforeHomepageSubmit({ values }, fetcher = fetch) {
  return validateHomepageRelease(values, await publishedReleaseChoices(fetcher));
}
