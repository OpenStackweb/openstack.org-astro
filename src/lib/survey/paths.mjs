/** Browser-safe paths shared by the embed loader and service gateway. */
export const MOUNT = '/user-survey/service';

export function isSurveyAssetPath(path) {
  return (
    typeof path === 'string' &&
    /^\/static\/[\w./-]+$/.test(path) &&
    !path.includes('//') &&
    !path.split('/').some((segment) => segment === '.' || segment === '..')
  );
}
