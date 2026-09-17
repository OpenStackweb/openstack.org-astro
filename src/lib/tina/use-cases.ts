import { requestWithMetadata } from '@tinacms/astro';
import { useCases } from '../../../tina/schema/use-cases';
import content from '../content/use-cases.json';
import { document } from './document';
export function loadUseCases() {
  const entry = document(useCases, 'use-cases', content);
  return requestWithMetadata({
    query: `query UseCasesEditor { ${entry.selection} }`,
    variables: {},
    data: { useCases: entry.data },
  });
}
