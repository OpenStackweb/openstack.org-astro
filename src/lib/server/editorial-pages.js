import { withArchiveEvent } from './archive-events.mjs';
import { prepareEditorialPage } from './editorial.mjs';
import paths from '../content/editorial-paths.json';

const records = import.meta.glob('../content/pages/*.json', { eager: true, import: 'default' });
const pages = new Map();
for (const record of Object.values(records)) {
  const page = withArchiveEvent(prepareEditorialPage(record));
  if (!paths.includes(page.path))
    throw new Error(`Editorial route is not registered: ${page.path}`);
  if (pages.has(page.path)) throw new Error(`Duplicate editorial path: ${page.path}`);
  pages.set(page.path, page);
}

export function editorialPageFor(path) {
  return pages.get(path.endsWith('/') ? path : `${path}/`);
}
