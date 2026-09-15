import inventory from './content/review-route-inventory.json' with { type: 'json' };

const surveyEntryPaths = new Set([
  '/survey/', '/surveys/', '/surveys/landing/', '/usersurvey/', '/user-survey/',
  '/jobmarket/', '/survey-report/', '/analytics/',
]);

// Exact historical links recovered against public article headings in Chrome.
// Blog hosting is a separate cutover decision; these are not imported articles.
const blogArticles = [
  { old: '/blog/2013/11/openstack-user-survey-october-2013/', path: '/blog/openstack-user-survey-october-2013/', title: 'OpenStack User Survey: October 2013' },
  { old: '/blog/2015/05/openstack-trainings-and-certifications-available-in-vancouver/', path: '/blog/openstack-trainings-and-certifications-available-in-vancouver/', title: 'OpenStack Trainings and Certifications Available in Vancouver' },
  { old: '/blog/2015/10/openstack-training-sessions-available-in-tokyo/', path: '/blog/openstack-training-sessions-available-in-tokyo/', title: 'OpenStack Training Sessions available in Tokyo' },
];

// Public record paths from the local inventory, checked against production on
// 2026-09-11. Native pages and redirects take precedence. This is review coverage,
// never a claim that a SilverStripe controller has been replaced.
export function reviewStatusFor(path) {
  if (!path.startsWith('/') || /[%\\.]|\/\//.test(path)) return null;
  const canonical = path.endsWith('/') ? path : `${path}/`;
  const source = inventory[canonical];
  const blogArticle = blogArticles.find(article => article.old === canonical || article.path === canonical);
  if (canonical === '/blog/' || blogArticle) {
    return {
      title: blogArticle?.title || 'The OpenStack Blog',
      status: 'Blog hosting decision pending',
      introduction: 'The blog is not migrated into this Astro preview. You can read the existing blog using the link below.',
      findings: [
        'The public blog pages use a WordPress theme. Migrating SilverStripe pages alone does not establish a replacement for the blog.',
        'Three historical links with year/month URL segments no longer resolve, but their articles remain available at current URLs.',
      ],
      next: [
        'Confirm the blog hosting and editorial workflow to retain when the main website moves.',
        'Verify archive URLs, media, feeds and any existing integrations before changing the public routing.',
      ],
      production: `https://www.openstack.org${blogArticle?.path || '/blog/'}`,
      link: blogArticle ? 'Read the article on the current blog' : 'Read the current OpenStack blog',
    };
  }
  if (['/make-some-news-with-openstack/', '/marketing/make-some-news-with-openstack/'].includes(canonical)) {
    return {
      title: 'Make Some News with OpenStack',
      status: 'Marketing guidance review pending',
      introduction: 'This guidance is being reviewed before it is restored. The current production link also leads to a missing page.',
      findings: [
        'The SilverStripe database retains an editorial page describing press support, social media requests and news promotion.',
        'Its instructions reference the legacy news-submission application, older links and response-time commitments that need confirmation.',
        'No news submission or editorial approval workflow is enabled by this preview.',
      ],
      next: [
        'Confirm current marketing contacts, submission channels and editorial guidelines before republishing the guidance through the Git CMS.',
        'Decide separately whether the SilverStripe news-submission workflow should be replaced or retired.',
      ],
      related: [{ label: 'Marketing Resources', href: '/marketing/' }],
    };
  }
  const historicalWorkflow = {
    '/summit/tokyo-2015/call-for-speakers/': 'Tokyo 2015 call for speakers',
    '/summit/berlin-2018/vote-for-speakers/': 'Berlin 2018 speaker voting',
    '/user-survey/survey-2018/': 'OpenStack User Survey 2018',
  }[canonical];
  if (historicalWorkflow) {
    return {
      title: historicalWorkflow,
      status: 'Historical application — replacement decision pending',
      introduction: 'This historical workflow is not enabled in the standalone preview.',
      findings: [
        'Existing public links still redirect here. Production currently sends anonymous visitors to SilverStripe sign-in.',
        'This preview does not submit proposals, cast votes or collect survey responses for the historical event.',
      ],
      next: ['Decide whether to retain a read-only archive, retire the workflow or connect an approved replacement service.'],
      related: [{ label: 'Explore the community', href: '/community/' }],
    };
  }
  const unavailableDestination = {
    '/fits/': { title: 'OpenStack Faithful Implementation Test Suite (FITS)', finding: 'Production displays a SilverStripe redirector with no configured destination.' },
    '/ptg/rooms/help/': { title: 'PTG room help', finding: 'Production displays a SilverStripe redirector with no configured destination.' },
    '/store/': { title: 'OpenStack store', finding: 'The store destination linked by production currently returns HTTP 404.' },
    '/summit/austin-2016/stack-city-community-party/': { title: 'Stack City community party — Austin 2016', finding: 'The historical event destination linked by production no longer resolves in DNS.' },
  }[canonical];
  if (unavailableDestination) {
    return {
      title: unavailableDestination.title,
      status: 'Original destination unavailable',
      introduction: 'The original destination is missing or unavailable. This preview keeps the context here instead of sending you to a broken link.',
      findings: [unavailableDestination.finding, 'Checked against the public production redirect on September 15, 2026.'],
      next: ['Confirm a replacement destination or retain this historical notice.'],
      related: [{ label: 'OpenStack community', href: '/community/' }],
    };
  }
  if (canonical === '/brand/web-badges/') {
    return {
      title: 'OpenStack web badges',
      status: 'Brand download workflow migration pending',
      introduction: 'Web badges are not available in this preview yet. The legacy website includes a guidelines-acceptance step that needs a reviewed replacement.',
      findings: [
        'SilverStripe checks a session flag before opening the badge download page. A separate form records acceptance of the guidelines.',
        'The current production URL also sends anonymous visitors to sign in. The replacement access requirements still need confirmation.',
        'This notice does not expose restricted downloads or record an agreement.',
      ],
      next: [
        'Confirm whether to retain the acceptance workflow or direct visitors to current Foundation brand resources.',
        'If retained, verify the required guidelines, permissions and approved badge assets before enabling downloads.',
      ],
      related: [{ label: 'OpenStack brand resources', href: '/brand/' }],
      production: 'https://www.openstack.org/brand/web-badges/',
      link: 'Open the legacy web-badges page (sign-in may be required)',
    };
  }
  if (surveyEntryPaths.has(canonical) ||
      (source && /^\/user-survey\/survey-\d{4}\/$/.test(canonical))) {
    return {
      title: canonical === '/analytics/' || canonical === '/survey-report/'
        ? 'User Survey analytics' : 'OpenStack User Survey',
      status: 'Survey application migration pending',
      introduction: 'The survey and its analysis tools need a replacement application before SilverStripe can be retired. This review page does not collect responses or sign you into the production survey.',
      findings: [
        'SilverStripe manages survey templates, signed-in multi-step responses and the deployment records associated with them.',
        'The analytics interface uses survey templates and reporting endpoints that are also part of SilverStripe. Those endpoints are not yet independent services.',
        'Published reports and the FAQ are separate content pages and are available in this preview.',
      ],
      next: [
        'Agree the service responsible for survey templates, responses, deployment records and reporting.',
        'Verify sign-in, permissions, saved progress, translations and administration against the replacement service.',
        'Keep editorial introductions and published reports in the content workflow; keep individual responses in the survey service.',
      ],
      related: [
        { label: 'User Survey FAQ', href: '/user-survey/faq/' },
        { label: '2022 User Survey report', href: '/user-survey/2022-user-survey-report/' },
        { label: '2018 User Survey report', href: '/user-survey/2018-user-survey-report/' },
      ],
      production: canonical === '/analytics/' || canonical === '/survey-report/'
        ? 'https://www.openstack.org/analytics/' : 'https://www.openstack.org/user-survey/',
      link: 'Open the production survey website',
    };
  }
  if (canonical === '/events/openstackdays-old/') {
    return {
      title: 'OpenStack and OpenInfra Days',
      status: 'Event listing and editorial decision pending',
      introduction: 'This legacy page combines organizer resources with an event directory. Its replacement needs an agreed content owner and event-data source.',
      findings: [
        'SilverStripe owns the introductory copy, hosting guidance, FAQs, artwork, documents and selected videos through CMS fields and related records.',
        'Upcoming and undated regional events are database queries. Featured past events and the “See More” action use separate event records and a SilverStripe endpoint.',
        'The production page still presents this as a live regional-event resource. A frozen copy of its listings would not keep future dates or organizer resources current.',
      ],
      next: [
        'Decide whether to retain this legacy resource, consolidate it with the current events destination, or provide a historical archive.',
        'If retained, move editorial guidance and downloadable resources into Git/Tina and R2, with an agreed owner for updates.',
        'Choose the service or editorial model for event listings, then verify dates, regions, sorting and past-event pagination before replacing that functionality.',
      ],
      production: 'https://www.openstack.org/events/openstackdays-old/',
      link: 'Review the existing OpenStack and OpenInfra Days page',
    };
  }
  if (canonical.startsWith('/community/speakers/')) {
    return {
      title: 'Speakers Bureau',
      status: 'Editorial decision pending',
      introduction: 'The Foundation needs to decide whether to retain and rebuild the Speakers Bureau. It is deferred in this preview while that decision is made.',
      findings: [
        'The production directory still lists speakers, but all three profile links sampled on September 15, 2026 returned 404. This sample does not establish that every profile is broken.',
        'Summit API has an OAuth-protected speakers endpoint and existing profile models. Live data coverage has not been verified.',
        'Bureau search, public-field privacy, profile editing and contact workflows need a defined replacement; copying directory content alone would not restore them.',
      ],
      next: [
        'Decide whether the bureau remains useful, who owns its content and which directory, profile and contact features to retain.',
        'If retained, assess Summit API reuse with a dedicated read-only service account and credentials held server-side in Cloudflare secrets, never in browser code or Git.',
        'Verify eligible records, visibility and API scopes before publishing profiles. Contact and profile-update workflows need separate authorization and service design.',
      ],
      production: 'https://www.openstack.org/community/speakers/',
      link: 'Review the current directory (sampled profile links are broken)',
    };
  }
  if (source === 'LogoGuidelinesPage' || source === 'LogoRightsPage') {
    return {
      title: source === 'LogoGuidelinesPage' ? 'OpenStack logo guidelines' : 'OpenStack trademark agreement',
      status: 'Brand agreement workflow decision pending',
      introduction: 'This section combines brand guidance with agreement and download workflows. The replacement needs confirmation from the Foundation before it can accept agreements or provide gated downloads.',
      findings: [
        'SilverStripe stores the guidelines and agreement copy in CMS fields. The guidelines form sets session state and redirects to a configured next step.',
        'The agreement template embeds an EchoSign widget. The code also contains a separate submission handler that stores contact details and emails staff; its current use has not been verified.',
        'Related download controllers check session flags. Copying the text would not replace agreement handling or download authorization.',
      ],
      next: [
        'Confirm which current Foundation brand and licensing process should own this workflow.',
        'If retained, verify the signing integration, agreement records, staff access and download requirements before enabling it.',
        'Keep approved guidance in Git-managed content; keep private agreement submissions out of Git and public media storage.',
      ],
      related: [{ label: 'OpenStack brand resources', href: '/brand/' }],
      production: `https://www.openstack.org${canonical}`,
      link: 'Review the existing brand page',
    };
  }
  if (source === 'SponsorsPage') {
    return {
      title: 'Historical summit sponsors',
      status: 'Historical sponsor archive decision pending',
      introduction: 'This historical sponsor listing is waiting for a decision on how to preserve its company records and sponsor tiers.',
      findings: [
        'The legacy CMS links each event page to company records, with sponsorship tier and optional event-specific links. The page is generated from those relationships.',
        'Company logos are shared records rather than images owned by this page. A current company logo is not necessarily the logo used at the historical event.',
      ],
      next: [
        'Confirm whether to preserve the published listing as a dated, Git-managed historical archive.',
        'Verify company names, tiers, links and approved logo assets against the database and rendered source before importing.',
        'Treat ongoing sponsorship management separately from historical archive editing.',
      ],
      production: `https://www.openstack.org${canonical}`,
      link: 'Review the original summit sponsor listing',
    };
  }
  const dynamic =
    /^\/(?:profile|community\/(?:members|speakers)|election|userprofile)(?:\/|$)/.test(path);
  if (!source && !dynamic) return null;
  const application =
    dynamic ||
    /(?:Election|Voter|Speaker|Sponsors|Voting|Registration|Survey|Passport|Dynamic|Member|Profile)/i.test(
      source || ''
    );
  const title = /^\/profile(?:\/|$)/.test(path)
    ? 'Your profile'
    : canonical
        .split('/')
        .filter(Boolean)
        .at(-1)
        .replaceAll('-', ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
  return {
    title,
    status: application ? 'Application migration pending' : 'Content migration pending',
    introduction:
      'This section is not yet available in the standalone beta. You are viewing a review notice, not the completed page. The beta no longer loads pages from SilverStripe.',
    findings: application
      ? [
          'This area includes data or workflows managed by the old website. A visual copy alone would not replace that functionality.',
          'Existing native pages remain available through the shared navigation.',
        ]
      : [
          'This URL belongs to the existing website. Its content or redirect still needs a reviewed native replacement.',
          'The original source, database and assets are available for that migration.',
        ],
    next: application
      ? [
          'Review the source and data model, then agree the replacement and its API or content ownership.',
          'Implement and verify the relevant browsing, sign-in and administration workflows.',
        ]
      : [
          'Port the content and assets, or confirm the intended redirect.',
          'Compare the result with production and check links, mobile layout, CMS editing and SEO metadata.',
        ],
    production: `https://www.openstack.org${canonical}`,
    link: 'View this area on the production website',
  };
}
