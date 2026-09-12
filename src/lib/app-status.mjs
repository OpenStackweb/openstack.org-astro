// Findings carried forward from the reviewed SvelteKit migration, September 12, 2026.
export const appStatus = {
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
