import { requestWithMetadata } from '@tinacms/astro';
import { marketplaceDetails } from '../../../tina/schema/marketplace-details';
import content from '../content/marketplace-details.json';
import { document } from './document';
export function loadMarketplaceDetails() {
  const entry = document(marketplaceDetails, 'marketplace-details', content);
  return requestWithMetadata({
    query: `query MarketplaceDetailsEditor { ${entry.selection} }`,
    variables: {},
    data: { marketplaceDetails: entry.data },
  });
}
