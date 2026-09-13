import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { loadProof } from '../../lib/tina/proof';
import HomeProof from '../../components/tina/HomeProof.astro';
import Homepage from '../../components/tina/Homepage.astro';
import Announcement from '../../components/tina/Announcement.astro';
import { loadHomepage, loadAnnouncement, loadSoftwareOverview } from '../../lib/tina/site';
import SoftwareOverview from '../../components/tina/SoftwareOverview.astro';
import { loadAi } from '../../lib/tina/ai';
import { loadVmware } from '../../lib/tina/vmware';
import VmwarePage from '../../components/tina/VmwarePage.astro';
import AiPage from '../../components/tina/AiPage.astro';
import { loadFooter } from '../../lib/tina/footer';
import Footer from '../../components/SiteFooter.astro';
export const prerender = false;
import { loadEditorial } from '../../lib/tina/editorial';
import EditorialPage from '../../components/tina/EditorialPage.astro';
export const POST = experimental_createIslandRoute({
  footer: {
    fetch: () => loadFooter(), component: Footer, wrapper: { tag: 'div' },
    propsFromData: result => ({ content: (result as Awaited<ReturnType<typeof loadFooter>>).data.footer }),
  },
  vmware: {
    fetch: () => loadVmware(), component: VmwarePage, wrapper: { tag: 'div' },
    propsFromData: result => ({ content: (result as Awaited<ReturnType<typeof loadVmware>>).data.vmware }),
  },
  ai: {
    fetch: () => loadAi(), component: AiPage, wrapper: { tag: 'div' },
    propsFromData: result => ({ content: (result as Awaited<ReturnType<typeof loadAi>>).data.ai }),
  },
  editorial: {
    fetch: (_request, params) => loadEditorial(params.get('document') || '', params.get('edit') === 'event'),
    component: EditorialPage,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadEditorial>>).data.editorial,
      sharedEvent: (result as Awaited<ReturnType<typeof loadEditorial>>).data.archiveEvent,
    }),
  },
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
