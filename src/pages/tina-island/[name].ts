import ProviderDetails from '../../components/marketplace/ProviderDetails.astro';
import Community from '../../components/Community.astro';
import SupportingOrganizations from '../../components/SupportingOrganizations.astro';
import { loadCommunity, loadSupportingOrganizations } from '../../lib/tina/community';
import catalogue from '../../lib/marketplace/catalog.json';
import { loadMarketplaceDetails } from '../../lib/tina/marketplace-details';
import { loadMarketplaceHome } from '../../lib/tina/marketplace-home';
import { loadMarketplaceShared } from '../../lib/tina/marketplace-shared';
import MarketplaceShared from '../../components/tina/MarketplaceShared.astro';
import MarketplaceHome from '../../components/tina/MarketplaceHome.astro';
import { loadMarketplacePage } from '../../lib/tina/marketplace';
import MarketplaceCategory from '../../components/tina/MarketplaceCategory.astro';
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
import { loadNavigation } from '../../lib/tina/navigation';
import Navigation from '../../components/SiteNavigation.astro';
import { loadFooter } from '../../lib/tina/footer';
import Footer from '../../components/SiteFooter.astro';
export const prerender = false;
import { loadEditorial } from '../../lib/tina/editorial';
import EditorialPage from '../../components/tina/EditorialPage.astro';
import { loadReleaseAnnouncement } from '../../lib/tina/releases';
import ReleaseAnnouncement from '../../components/tina/ReleaseAnnouncement.astro';
import { loadSoftwareStart } from '../../lib/tina/software-start';
import SoftwareStart from '../../components/tina/SoftwareStart.astro';
import { loadUseCases } from '../../lib/tina/use-cases';
import UseCases from '../../components/tina/UseCases.astro';
import { loadMarketing } from '../../lib/tina/marketing';
import MarketingResources from '../../components/tina/MarketingResources.astro';
export const POST = experimental_createIslandRoute({
  'marketplace-shared': {
    fetch: () => loadMarketplaceShared(), component: MarketplaceShared, wrapper: { tag: 'div' },
    propsFromData: (result, params) => ({ content: (result as Awaited<ReturnType<typeof loadMarketplaceShared>>).data.marketplaceShared, section: params.get('section') === 'join' ? 'join' : 'resources' }),
  },
  community: {
    fetch: () => loadCommunity(), component: Community, wrapper: { tag: 'div' },
    propsFromData: result => ({ content: (result as Awaited<ReturnType<typeof loadCommunity>>).data.community }),
  },
  'supporting-organizations': {
    fetch: () => loadSupportingOrganizations(), component: SupportingOrganizations, wrapper: { tag: 'div' },
    propsFromData: result => ({ content: (result as Awaited<ReturnType<typeof loadSupportingOrganizations>>).data.supportingOrganizations }),
  },
  'marketplace-details': {
    fetch: () => loadMarketplaceDetails(),
    component: ProviderDetails,
    wrapper: { tag: 'div' },
    propsFromData: (result, params) => {
      const record = catalogue.categories
        .map((category) => category.records.find((record) => record.href === params.get('record')))
        .find(Boolean);
      if (!record) throw new Error('Unknown Marketplace provider');
      return {
        content: (result as Awaited<ReturnType<typeof loadMarketplaceDetails>>).data
          .marketplaceDetails,
        record,
        section: params.get('section') === 'details' ? 'details' : 'overview',
      };
    },
  },
  'marketplace-home': {
    fetch: () => loadMarketplaceHome(),
    component: MarketplaceHome,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadMarketplaceHome>>).data.marketplaceHome,
    }),
  },
  marketplace: {
    fetch: (_request, params) => loadMarketplacePage(params.get('document') || ''),
    component: MarketplaceCategory,
    wrapper: { tag: 'div' },
    propsFromData: (result, params) => ({
      content: (result as Awaited<ReturnType<typeof loadMarketplacePage>>).data.marketplacePage,
      section: ['footer', 'icon'].includes(params.get('section') || '') ? params.get('section') : 'header',
    }),
  },
  marketing: {
    fetch: () => loadMarketing(),
    component: MarketingResources,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadMarketing>>).data.marketing,
    }),
  },
  'use-cases': {
    fetch: () => loadUseCases(),
    component: UseCases,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadUseCases>>).data.useCases,
    }),
  },
  'software-start': {
    fetch: () => loadSoftwareStart(),
    component: SoftwareStart,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadSoftwareStart>>).data.softwareStart,
    }),
  },
  'release-announcement': {
    fetch: (_request, params) =>
      loadReleaseAnnouncement(params.get('document') || '', params.get('draft') === 'true'),
    component: ReleaseAnnouncement,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadReleaseAnnouncement>>).data
        .releaseAnnouncement,
    }),
  },
  navigation: {
    fetch: () => loadNavigation(),
    component: Navigation,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadNavigation>>).data.navigation,
    }),
  },
  footer: {
    fetch: () => loadFooter(),
    component: Footer,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadFooter>>).data.footer,
    }),
  },
  vmware: {
    fetch: () => loadVmware(),
    component: VmwarePage,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadVmware>>).data.vmware,
    }),
  },
  ai: {
    fetch: () => loadAi(),
    component: AiPage,
    wrapper: { tag: 'div' },
    propsFromData: (result) => ({
      content: (result as Awaited<ReturnType<typeof loadAi>>).data.ai,
    }),
  },
  editorial: {
    fetch: (_request, params) =>
      loadEditorial(params.get('document') || '', params.get('edit') === 'event'),
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
