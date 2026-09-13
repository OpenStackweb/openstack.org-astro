import { requestWithMetadata } from '@tinacms/astro';
import { ai } from '../../../tina/schema/ai';
import content from '../content/openstack-for-ai.json';
import { document } from './site';
export function loadAi() {
  const entry = document(ai, 'openstack-for-ai', content);
  return requestWithMetadata({ query: `query AiEditor { ${entry.selection} }`, variables: {}, data: { ai: entry.data } });
}
