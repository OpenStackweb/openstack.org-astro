/** Only allow assets served by the survey gateway, never arbitrary URLs. */
function assetUrl(path) {
  if (
    typeof path !== 'string' ||
    !/^static\/[\w./-]+$/.test(path) ||
    path.split('/').some((segment) => segment === '.' || segment === '..')
  ) {
    throw Error('Invalid survey asset');
  }
  return '/user-survey/service/' + path;
}

export function surveyAssets(manifest) {
  if (
    !manifest ||
    !Array.isArray(manifest.styles) ||
    manifest.styles.length > 10 ||
    typeof manifest.script !== 'string' ||
    !manifest.script.endsWith('.js')
  ) {
    throw Error('Invalid survey manifest');
  }
  return {
    script: assetUrl(manifest.script),
    styles: manifest.styles.map(assetUrl),
  };
}
