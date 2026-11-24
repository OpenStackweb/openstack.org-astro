// Service boundaries from the migration review, updated September 17, 2026.
export const appStatus = {
  software: {
    title: 'Software — migration status',
    status: 'This Software destination is not available in the preview yet',
    introduction:
      'The requested legacy Software page has not been ported to this Astro preview. The development catalogue is available, but it does not yet replace every historical release, category or sample-configuration page.',
    findings: [
      'The existing React catalogue runs inside the shared Astro header and footer using a development service snapshot.',
      'Release announcements are separate Git-managed content, editable in Tina. Migrating an announcement does not verify the catalogue records for that release.',
      'This destination is a migration notice. No legacy proxy or production Software sign-in is enabled here.',
    ],
    next: [
      'Configure and verify the production Software service, dataset and identity provider.',
      'Map the legacy release, category and sample-configuration destinations to verified replacement content.',
      'Verify shared sign-in, navigation and administrator workflows before declaring the Software application ready.',
    ],
    related: [
      {
        href: '/software/project-navigator/openstack-components/',
        label: 'Browse the development Software catalogue',
      },
      { href: '/latest-release/', label: 'Read the current release announcement' },
    ],
    production: 'https://www.openstack.org/software/',
    link: 'Browse Software on the production website',
  },
  videos: {
    title: 'Videos',
    status: 'Historical video routes — mapping pending',
    introduction:
      'OpenStack video discovery now uses the Foundation’s YouTube channel. The new /videos/ page selects recent and popular OpenStack videos. This historical catalogue route still needs a verified mapping to its original video or event playlist.',
    findings: [
      'The current video library is a React application with SilverStripe handling its catalogue, search, curation and background updates.',
      'The existing Summit API already exposes video metadata and relationships to events, speakers, tracks and presentation materials.',
      'Live checks found all 522 legacy Boston videos in the public API. For Tokyo, the public schedule endpoint exposes 119 of 316 videos: the other 197 belong to events that are not published on the schedule.',
    ],
    next: [
      'The YouTube channel and automatic OpenStack-focused selection were approved September 22.',
      'Agree how existing video-detail URLs, search results and historical links should behave if the catalogue is retired.',
      'Preserve historical links until exact YouTube targets are verified. Authenticated Summit API compatibility work remains paused.',
    ],
    production: 'https://www.youtube.com/@OpenInfraFoundation',
    link: 'Browse the Foundation YouTube channel',
  },
  marketplace: {
    title: 'Marketplace',
    status: 'Public browsing integrated; production service acceptance pending',
    introduction:
      'The Marketplace now runs within the shared Astro layout using the public service catalogue. This destination still needs review; the integrated category pages support browsing, maps and provider details.',
    findings: [
      'Marketplace has its own application and service-managed ecosystem data. Listings belong to that service, rather than the website content CMS.',
      'Seven catalogue families, training courses, provider specifications and video embeds are integrated. Page copy, icons, badges and shared resources are editable in Tina. Review display and filter controls have been removed.',
      'The site does not proxy the legacy Marketplace. Catalogue records remain API-owned; no provider or review submissions are enabled here.',
      'Review moderation still runs in SilverStripe. Its planned replacement is a Django REST Framework service with migrated data and Django admin; that replacement is not yet integrated here.',
    ],
    next: [
      'Complete a fresh Marketplace data import, refresh this catalogue and compare it with the live site before launch.',
      'Configure and verify the production identity provider, shared sign-in and required permissions.',
      'Confirm the provider administration and legacy moderation retirement plan, with service owners and verified permissions, before declaring the application production-ready.',
    ],
    production: 'https://www.openstack.org/marketplace/',
    link: 'Browse the production Marketplace',
  },
};
