import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { loadProof } from '../../lib/tina/proof';
import HomeProof from '../../components/tina/HomeProof.astro';
import Homepage from '../../components/tina/Homepage.astro';
import Announcement from '../../components/tina/Announcement.astro';
import { loadHomepage, loadAnnouncement, loadSoftwareOverview } from '../../lib/tina/site';
import SoftwareOverview from '../../components/tina/SoftwareOverview.astro';
export const prerender = false;
export const POST = experimental_createIslandRoute({
  'software-overview': {
    fetch: () => loadSoftwareOverview(),
    component: SoftwareOverview,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadSoftwareOverview>>).data.softwareOverview,
    }),
  },
  homepage: {
    fetch: () => loadHomepage(),
    component: Homepage,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      data: (result as Awaited<ReturnType<typeof loadHomepage>>).data,
    }),
  },
  announcement: {
    fetch: () => loadAnnouncement(),
    component: Announcement,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadAnnouncement>>).data.announcement,
      compact: true,
    }),
  },
  'home-proof': {
    fetch: () => loadProof(),
    component: HomeProof,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadProof>>).data.proof,
    }),
  },
});
