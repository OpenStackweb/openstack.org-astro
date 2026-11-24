import { requestWithMetadata } from '@tinacms/astro';
import { mascots } from '../../../tina/schema/mascots';
import content from '../content/project-mascots.json';
import { document } from './document';
export function loadMascots() {
  const entry = document(mascots, 'project-mascots', content);
  return requestWithMetadata({
    query: `query MascotsEditor { ${entry.selection} }`,
    variables: {},
    data: { mascots: entry.data },
  });
}
