import { readFile } from 'node:fs/promises';

// Match the runtime catalog map, including releases with an explicit empty state.
const current = JSON.parse(
  await readFile(new URL('../../src/lib/software/catalog-release.json', import.meta.url), 'utf8'),
);
const history = JSON.parse(
  await readFile(new URL('../../src/lib/software/release-history.json', import.meta.url), 'utf8'),
);
export const softwareSamplePaths = [
  '/software/sample-configs/',
  ...new Set([current.slug, ...history.map((item) => item.release.slug)]).values(),
].map((value) =>
  value.startsWith('/') ? value : `/software/sample-configs/?release=${encodeURIComponent(value)}`,
);
