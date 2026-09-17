import { requestWithMetadata } from '@tinacms/astro';
import { document } from './document';
import { homepage, announcement } from '../../../tina/schema/site';
import { softwareOverview } from '../../../tina/schema/software';
import softwareContent from '../content/software-overview.json';
import homeContent from '../content/home.json';
import bannerContent from '../content/announcement-banner.json';

const home = document(homepage, 'home', homeContent);
const banner = document(announcement, 'announcement-banner', bannerContent);
const software = document(softwareOverview, 'software-overview', softwareContent);
// Visitors render committed Git content. Tina uses this schema-matched metadata
// to replace only the editing preview, without a CMS request on normal page views.
export const loadHomepage = () =>
  requestWithMetadata({
    query: `query HomepageEditor { ${home.selection} ${banner.selection} }`,
    variables: {},
    data: { homepage: home.data, announcement: banner.data },
  });
export const loadAnnouncement = () =>
  requestWithMetadata({
    query: `query AnnouncementEditor { ${banner.selection} }`,
    variables: {},
    data: { announcement: banner.data },
  });
export const loadSoftwareOverview = () =>
  requestWithMetadata({
    query: `query SoftwareOverviewEditor { ${software.selection} }`,
    variables: {},
    data: { softwareOverview: software.data },
  });
