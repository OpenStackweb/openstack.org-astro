import { requestWithMetadata } from '@tinacms/astro';
import { marketplaceShared } from '../../../tina/schema/marketplace-shared';
import content from '../content/marketplace-shared.json';
import { document } from './document';
export function loadMarketplaceShared() {
  const entry = document(marketplaceShared, 'marketplace-shared', content);
  return requestWithMetadata({
    query: `query MarketplaceSharedEditor { ${entry.selection} }`,
    variables: {},
    data: { marketplaceShared: entry.data },
  });
}
