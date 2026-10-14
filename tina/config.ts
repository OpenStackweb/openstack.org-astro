import { SoftwareCataloguePanel } from './SoftwareCataloguePanel';
import { videos } from './schema/videos';
import { community, supportingOrganizations } from './schema/community';
import { marketplaceDetails } from './schema/marketplace-details';
import { marketplaceHome } from './schema/marketplace-home';
import { marketplaceShared } from './schema/marketplace-shared';
import { marketplacePage } from './schema/marketplace';
import { defineConfig, InfoBox } from 'tinacms';
import { installAdminStyles } from './admin-styles';
import { ReleaseCreditsField } from './ReleaseCreditsField';
import { HighlightsStatisticsField } from './HighlightsStatisticsField';
import { ai } from './schema/ai';
import { navigation } from './schema/navigation';
import { footer } from './schema/footer';
import { vmware } from './schema/vmware';
import { homepage, announcement } from './schema/site';
import { softwareOverview } from './schema/software';
import { useCases } from './schema/use-cases';
import { marketing } from './schema/marketing';
import { softwareStart } from './schema/software-start';
import { releaseAnnouncement } from './schema/releases';
import { editorial } from './schema/editorial';
import { archiveEvent } from './schema/archive-events';
import { SectionLinksField, validateSectionLinks } from './SectionLinksField';
import { FaqTopicsField, validateFaqTopics } from './FaqTopicsField';
import { OptionalTextField } from './OptionalTextField';

export default defineConfig({
  cmsCallback: (cms) => {
    installAdminStyles();
    cms.plugins.add({ __type: 'field', name: 'highlights-statistics', Component: HighlightsStatisticsField });
    cms.plugins.add({ __type: 'field', name: 'release-credits', Component: ReleaseCreditsField });
    return cms;
  },
  ui: { previewUrl: ({ branch }) => ({ url: `https://astro.openstack.org/review/branch/?branch=${encodeURIComponent(branch)}` }) },
  branch: process.env.TINA_BRANCH || 'main',
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { loadCustomStore: async () => (await import('./r2-media-store')).R2MediaStore },
  schema: {
    collections: [
      { ...community, fields: [
        { type: 'displayOnly', name: 'communityOwnership', ui: { component: InfoBox({ message: 'Edit headings, copy, images, links and ordered selections here. Projects and member profiles come from reviewed service snapshots; their names, photos and records are managed outside Tina. Layout and contribution-panel behavior are maintained in Astro.' }) } },
        ...community.fields,
      ] },
      { ...supportingOrganizations, fields: [
        { type: 'displayOnly', name: 'organizationOwnership', ui: { component: InfoBox({ message: 'Edit page copy, section order and infrastructure-donor selections here. Membership tiers, company profiles and logos come from the reviewed service snapshot. Changing a section does not change membership.' }) } },
        ...supportingOrganizations.fields,
      ] },
      videos,
      marketplaceHome,
      marketplaceShared,
      { ...marketplaceDetails, fields: [
        { type: 'displayOnly', name: 'serviceOwnership', ui: { component: InfoBox({ message: 'These labels and badge descriptions are shared across all provider pages. Qualification flags, provider records and reviews are owned by the Marketplace API. Editing copy does not qualify a provider or enable review submissions.' }) } },
        ...marketplaceDetails.fields,
      ] },
      {...marketplacePage, fields: [
        {type:'displayOnly', name:'serviceOwnership', ui:{component:InfoBox({message:'Edit Marketplace page copy and section icons here. Global resource links are managed in Marketplace — shared sidebar. Providers, courses, locations and service qualifications come from the Marketplace API and are not edited in Tina. Production administration remains a separate integration.'})}},
        ...marketplacePage.fields,
      ]},
      homepage,
      footer,
      navigation,
      ai,
      vmware,
      announcement,
      releaseAnnouncement,
      softwareStart,
      marketing,
      { ...useCases, fields: [
        { type: 'displayOnly', name: 'catalogueOwnership', ui: { component: InfoBox({
          message: 'Edit this page’s introduction, video, images and interface labels here. User stories and company records come from the existing catalogue snapshot and are not edited in this form. Catalogue administration remains a separate migration decision.',
        }) } }, ...useCases.fields,
      ] },
      {
        ...archiveEvent,
        fields: archiveEvent.fields.map(field => field.name === 'navigation'
          ? { ...field, ui: { component: SectionLinksField, validate: validateSectionLinks } }
          : field.type === 'string' && ['introduction', 'resources'].includes(field.name)
            ? { ...field, ui: { component: OptionalTextField } } : field),
      },
      {
        ...editorial,
        fields: editorial.fields.map((field) => field.type === 'object' && field.name === 'sectionNavigation'
          ? { ...field, ui: { component: SectionLinksField, validate: validateSectionLinks } }
          : field.type === 'object' && field.name === 'faq' && field.fields
            ? { ...field, fields: field.fields.map(topic => topic.type === 'object' && topic.name === 'categories' && topic.fields
              ? { ...topic, ui: { component: FaqTopicsField, validate: validateFaqTopics } } : topic) }
            : field),
      },
      {
        ...softwareOverview,
        fields: [
          {
            type: 'displayOnly', name: 'softwareAdmin',
            ui: { component: InfoBox({
              message: 'Software catalogue data is managed in the Software service. This development admin uses a separate login. The fields below edit only this page’s text, images and navigation.',
              links: [{ text: 'Open Software development admin ↗', url: 'https://software-api.devbranch.openstack.org/admin/' }],
            }) },
          },
          { type: 'displayOnly', name: 'catalogueRefresh', ui: { component: SoftwareCataloguePanel } },
          ...softwareOverview.fields!,
        ],
      },
      {
        name: 'proof',
        label: 'CMS proof — homepage content',
        path: 'src/lib/content/cms-proof',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/cms-proof/' },
        fields: [
          { type: 'string', name: 'title', label: 'Headline', isTitle: true, required: true },
          {
            type: 'string',
            name: 'description',
            label: 'Introduction',
            ui: { component: 'textarea' },
          },
          { type: 'image', name: 'image', label: 'Hero image' },
          { type: 'string', name: 'imageAlt', label: 'Image description', required: true },
          { type: 'string', name: 'buttonLabel', label: 'Button text' },
          { type: 'string', name: 'buttonUrl', label: 'Button destination' },
          { type: 'image', name: 'download', label: 'Optional PDF download', accept: 'pdf' },
          {
            type: 'object',
            name: 'cards',
            label: 'Ways to use OpenStack',
            list: true,
            ui: { itemProps: (item) => ({ label: item.title }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'text', label: 'Description', ui: { component: 'textarea' } },
              { type: 'string', name: 'link', label: 'Destination' },
            ],
          },
        ],
      },
    ],
  },
});
