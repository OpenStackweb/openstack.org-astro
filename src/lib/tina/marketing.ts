import { requestWithMetadata } from '@tinacms/astro';
import { marketing } from '../../../tina/schema/marketing';
import content from '../content/marketing-resources.json';
import { document } from './site';
export function loadMarketing() {
  const entry = document(marketing, 'marketing-resources', content);
  return requestWithMetadata({ query: `query MarketingEditor { ${entry.selection} }`, variables: {}, data: { marketing: entry.data } });
}
