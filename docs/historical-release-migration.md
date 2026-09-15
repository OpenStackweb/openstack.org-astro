# Historical software release overviews

Reviewed September 15, 2026. Production GET requests to `/software/essex/`,
`folsom`, `grizzly`, `havana`, `icehouse`, `juno` and `kilo` all returned HTTP404.
The supplied full database retains published SiteTree_Live editorial pages for
these releases: IDs277,724,503,997,1354,2001,2479. They use the explicit Page class.
Six inherit visibility from the root Software page (369); Kilo explicitly permits
Anyone. They were hidden from menus, not stored as private-member records.

Source context: OpenStackweb/openstack-org at
`2172298743fe807a92758cf307059b69a7dba668`, generic Page template and controller.
The recovered Content fields are HTML release overviews, feature descriptions,
dashboard screenshots, historical links and contributor acknowledgments. Inspection
found no forms, scripts, iframes, object embeds, preformatted code or shortcodes.
No credential-like query parameters were found. The local database was read with
the SELECT-only account and explicitly shut down afterwards; no PHP/jobs ran.

`import-historical-releases.mjs` consumes the private seven-record JSON export.
It checks the expected slugs, normalizes SilverStripe base-relative URLs to root
paths, and demotes stored H1s under a single archive title. Raw database exports
stay outside Git. The resulting `src/lib/content/software-archives/*.json` files
are rare Git-only editorial content, not catalogue/service records or Tina release
announcements. No current software data or production identity configuration changed.

The exact legacy routes render through the shared Editorial component before the
software route's development catalogue branch. Other catalogue/current-release
URLs retain their existing behavior. These pages have explicit historical-context
notices; old documentation, downloads, affiliations and support claims are not
presented as current guidance. Original screenshot links work as ordinary image
links, not a legacy JavaScript lightbox. The shared responsive editorial layout
replaces old Bootstrap columns; this is not visual parity with a currently live
page, since the public routes are404. Contributor text remains intact and visible.

Media evidence is in `historical-release-assets.json`. All69 referenced image URLs
were recovered and inspected in a contact sheet, including39 inline images and
full-size screenshots. R2 checksum/size readback is a separate publication gate.
No original image binaries are committed. The automated tests compare all rendered
editorial text to the imported content and check each image route against mediaKey
and the registry; catalogue routes are explicitly tested to remain outside this
archive resolver.

Local validation: normal build, Astro check260files/zero errors or warnings/two
hints and102tests passed. All seven routes reviewed at390px after images decoded:
oneH1,39totalinlineimages/zero broken,no horizontal overflow. Kilo was also viewed
at1440px. Local media used page-scoped private-file fulfillment, so hosted R2
acceptance is still separate. SEO audit1,248targets/zero issues; offline sitemap
260candidates/986held. Asset audit237sources/zero errors/unresolved local references.
Internal-link audit240sources/734targets still classifies deferred apps and external
or query destinations; historical outbound content is not fully revalidated.
The515routeinventory is156redirects/257rendered-unverified/102notices/no errors.
Seven former generic software redirects now render source-backed archives.

Remaining acceptance: verify actual hosted images after deployment, keep current
Software service/IDP work deferred as previously agreed, and record any unavailable
historical external destinations in the editorial review rather than inventing
modern equivalents. No production DNS, Netlify or SilverStripe changes.

R2 publication gate passed for all69 manifest entries: 68 uploaded, 1 reused, every readback matching size and SHA256.

## Hosted acceptance — September 15, 2026

Commit `82bb2cf` passed Publish 34990238427 and Validate 34990238216. An authenticated standalone Playwright browser checked all seven deployed archive pages without response overrides: HTTP200, one H1 each, all39 inline images decoded after scrolling, and no horizontal overflow at a390px viewport (375px document area). Kilo image/body rendering was visually inspected. Lazy-loaded images below the fold had to be scrolled into view; waiting for them to become visible at the top of the page was not a valid failure test. `/essex/` resolved to its native archive; `/software/` and the current Gazpacho announcement remained distinct200 pages with their expected headings. This does not certify every external download link or live visual parity, since the seven production archive URLs currently return404.
