import { requestWithMetadata } from '@tinacms/astro';
import { marketplacePage } from '../../../tina/schema/marketplace';
import { document } from './document';
const pages = import.meta.glob('../content/marketplace/*.json', { eager: true, import: 'default' });
export function loadMarketplacePage(slug: string) {
  const content = pages[`../content/marketplace/${slug}.json`];
  if (!content) throw new Error('Unknown Marketplace editorial page');
  const entry = document(marketplacePage, slug, content);
  return requestWithMetadata({
    query: `query MarketplaceEditor { ${entry.selection} }`,
    variables: {},
    data: { marketplacePage: entry.data },
  });
}
