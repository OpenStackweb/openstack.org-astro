import { preparePaper } from './papers.mjs';
const records = import.meta.glob('../content/papers/*.json', { eager: true, import: 'default' });
const pages = new Map();
for (const record of Object.values(records)) {
  const page = preparePaper(record);
  const key = page.path + page.locale;
  if (pages.has(key)) throw new Error('Duplicate paper translation');
  pages.set(key, page);
}
export function paperPageFor(path, locale = 'en_US') {
  const canonical = path.endsWith('/') ? path : path + '/';
  return pages.get(canonical + locale) || pages.get(canonical + 'en_US');
}
