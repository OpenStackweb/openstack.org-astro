import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { loadProof } from '../../lib/tina/proof';
import HomeProof from '../../components/tina/HomeProof.astro';
export const prerender = false;
export const POST = experimental_createIslandRoute({
  'home-proof': {
    fetch: () => loadProof(), component: HomeProof, wrapper: { tag: 'div' },
    propsFromData: (result) => ({ content: (result as Awaited<ReturnType<typeof loadProof>>).data.proof }),
  },
});
