import inventory from './content/review-route-inventory.json' with { type: 'json' };

// Public record paths from the local inventory, checked against production on
// 2026-09-11. Native pages and redirects take precedence. This is review coverage,
// never a claim that a SilverStripe controller has been replaced.
export function reviewStatusFor(path) {
  if (!path.startsWith('/') || /[%\\.]|\/\//.test(path)) return null;
  const canonical = path.endsWith('/') ? path : `${path}/`;
  const source = inventory[canonical];
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
