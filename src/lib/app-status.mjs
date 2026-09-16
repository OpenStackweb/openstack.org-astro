// Findings carried forward from the reviewed SvelteKit migration, September 12, 2026.
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
        { href: '/software/project-navigator/openstack-components/', label: 'Browse the development Software catalogue' },
        { href: '/latest-release/', label: 'Read the current release announcement' },
      ],
      production: 'https://www.openstack.org/software/',
      link: 'Browse Software on the production website',
    },
    mascots: {
      title: 'OpenStack project mascots',
      status: 'Logo catalogue ownership review',
      introduction:
        'The project mascot download gallery has not yet been migrated. The existing gallery remains available on the production website while we confirm how logo packages will be managed.',
      findings: [
        'SilverStripe stores project mascot records and discovers multiple downloadable image and EPS files in object storage. The gallery includes download links and copyable embed code.',
        'Software API already includes mascot records, a file relationship and an administrator interface. Its current model associates one file with each mascot, rather than a complete set of logo variants.',
        'The mascot images already displayed by the Software preview do not establish that the full download gallery or its editing workflow has been migrated.',
      ],
      next: [
        'Confirm whether Software API or the Git content workflow should own mascot packages and their file variants.',
        'Verify published records, visibility rules and the required files before selectively migrating approved assets.',
        'Build and verify the gallery, downloads, copy-code controls and administrator workflow against the chosen owner.',
      ],
      production: 'https://www.openstack.org/project-mascots/',
      link: 'Browse the production mascot gallery',
    },
    videos: {
      title: 'Videos',
      status: 'Backend compatibility review',
      introduction:
        'The video library is being assessed for a native Astro experience. This beta section is a migration update; the existing library is still available on the production website.',
      findings: [
        'The current video library is a React application with SilverStripe handling its catalogue, search, curation and background updates.',
        'The existing Summit API already exposes video metadata and relationships to events, speakers, tracks and presentation materials.',
        'Live checks found all 522 legacy Boston videos in the public API. For Tokyo, the public schedule endpoint exposes 119 of 316 videos: the other 197 belong to events that are not published on the schedule.',
      ],
      next: [
        'Check whether the existing authenticated presentation endpoints expose the complete archive without API changes.',
        'Confirm publication rules, featured and popular selections, search, and the ongoing administration and refresh process.',
        'Agree the implementation before building the replacement. A native Astro interface backed by the existing Summit API is the current candidate.',
      ],
      production: 'https://www.openstack.org/videos/',
      link: 'Browse the production video library',
    },
    marketplace: {
      title: 'Marketplace',
      status: 'Integration pending',
      introduction:
        'The Marketplace is planned to join this site as a React application within the shared Astro layout. This beta section is a migration update; the current Marketplace remains available on the production website.',
      findings: [
        'Marketplace has its own application and service-managed ecosystem data. Listings belong to that service, rather than the website content CMS.',
        'The agreed direction is to keep one site header, footer and sign-in experience while integrating the Marketplace application.',
        'The previous beta routes displayed the legacy Marketplace through a proxy. That did not establish that the replacement application was ready.',
      ],
      next: [
        'Complete the React application integration and verify the production service and dataset.',
        'Configure and verify the production identity provider, shared sign-in and required permissions.',
        'Check browsing, filters, maps, listing details and administrator workflows before declaring this section ready.',
      ],
      production: 'https://www.openstack.org/marketplace/',
      link: 'Browse the production Marketplace',
    },
  };
