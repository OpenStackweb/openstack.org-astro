import { requestWithMetadata } from '@tinacms/astro';
import { navigation } from '../../../tina/schema/navigation';
import content from '../content/navbar.json';
import { document } from './site';
export function loadNavigation() {
  const entry = document(navigation, 'navbar', content);
  return requestWithMetadata({ query: `query NavigationEditor { ${entry.selection} }`, variables: {}, data: { navigation: entry.data } });
}
