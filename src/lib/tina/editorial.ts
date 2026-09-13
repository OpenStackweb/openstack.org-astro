import { requestWithMetadata } from '@tinacms/astro';
import { editorial } from '../../../tina/schema/editorial';
import pages from '../../../tina/editorial-pages.json';
import { document } from './site';

const records = import.meta.glob('../content/pages/*.json', { eager: true, import: 'default' });
export const editablePageFor = (path: string) => pages.find((page) => page.path === path);
export async function loadEditorial(filename: string) {
  if (!pages.some((page) => page.filename === filename)) throw new Error('Unknown editorial document');
  const content = records[`../content/pages/${filename}.json`];
  const entry = document(editorial, filename, content);
  return requestWithMetadata({
    query: `query EditorialEditor { ${entry.selection} }`, variables: {},
    data: { editorial: entry.data },
  });
}
