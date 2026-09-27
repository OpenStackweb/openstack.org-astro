import { softwareCandidateFiles } from './software-candidate.mjs';

export const snapshotFiles = [
  'catalog.json',
  'catalog-release.json',
  'sample-configurations.json',
  'release-history.json',
];
export function prepareSoftwareRefresh(result, previous, now = new Date().toISOString()) {
  const files = softwareCandidateFiles(result);
  const changed = snapshotFiles.filter(
    (name) => JSON.stringify(files[name]) !== JSON.stringify(previous[name]),
  );
  const count = (nodes) =>
    nodes.reduce((sum, node) => sum + node.components.length + count(node.subcategories), 0);
  const summary = {
    previousRelease: previous['catalog-release.json'].name,
    release: files['catalog-release.json'].name,
    previousComponents: count(previous['catalog.json']),
    components: count(files['catalog.json']),
    historicalReleases: files['release-history.json'].length,
    changedFiles: changed,
  };
  return {
    files,
    changed,
    summary,
    metadata: {
      refreshedAt: now,
      source: new URL(result.source).origin,
      release: summary.release,
      components: summary.components,
      historicalReleases: summary.historicalReleases,
    },
  };
}
