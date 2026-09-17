import { requestWithMetadata } from '@tinacms/astro';
import { marketplaceHome } from '../../../tina/schema/marketplace-home';
import content from '../content/marketplace-home.json';
import { document } from './document';
export function loadMarketplaceHome() {
  const entry = document(marketplaceHome, 'marketplace-home', content);
  return requestWithMetadata({
    query: `query MarketplaceHomeEditor { ${entry.selection} }`,
    variables: {},
    data: { marketplaceHome: entry.data },
  });
}
