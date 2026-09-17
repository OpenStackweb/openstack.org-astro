import { requestWithMetadata } from '@tinacms/astro';
import { footer } from '../../../tina/schema/footer';
import content from '../content/footer.json';
import { document } from './document';
export function loadFooter() {
  const entry = document(footer, 'footer', content);
  return requestWithMetadata({
    query: `query FooterEditor { ${entry.selection} }`,
    variables: {},
    data: { footer: entry.data },
  });
}
