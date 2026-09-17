import { requestWithMetadata } from '@tinacms/astro';
import content from '../content/cms-proof/home.json';

// Public rendering reads Git content, never a live CMS API. Tina's overlay replaces
// this data only inside its editing context, using this matching GraphQL query.
const query = `query Proof($relativePath: String!) {
  proof(relativePath: $relativePath) {
    __typename title description image imageAlt buttonLabel buttonUrl download
    cards { __typename title text link }
    _sys { filename basename breadcrumbs path relativePath extension }
    id
  }
}`;
export async function loadProof() {
  return requestWithMetadata({
    query,
    variables: { relativePath: 'home.json' },
    data: {
      proof: {
        ...content,
        __typename: 'Proof',
        id: 'src/lib/content/cms-proof/home.json',
        cards: content.cards.map((card) => ({ ...card, __typename: 'ProofCards' })),
        _sys: {
          filename: 'home',
          basename: 'home.json',
          breadcrumbs: ['home'],
          path: 'src/lib/content/cms-proof/home.json',
          relativePath: 'home.json',
          extension: '.json',
        },
      },
    },
  });
}
