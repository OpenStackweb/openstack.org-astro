# OpenDev 2020 historical archive

Source reviewed September 15, 2026: OpenStackweb/openstack-org at
`2172298743fe807a92758cf307059b69a7dba668`, especially
`summit/code/pages/GeneralEventsLandingPage.php`,
`summit/templates/Layout/GeneralEventsLandingPage.ss` and its header include.

The landing body is static template content, not a Summit API result: three event
cards, four explanatory sections, outcomes, attendee information, 14 committee
members, 25 sponsor acknowledgments and inclusion copy. Astro now renders this
from `src/lib/content/archives/opendev-2020.json`. This rare historical archive is
edited directly in Git; it is not a Tina collection. Source images remain in R2.
This does not migrate the OpenDev sponsor/travel subpages or certify their logic.

The shared Astro header/footer replace the old event shell. Original OpenDev
branding, dates, descriptions, recordings/recap links and historical affiliations
are retained. The sponsor carousel becomes an accessible static grid. The
introduction video has a direct YouTube link. Current-Summit registration hooks,
tracking and the obsolete hidden registration modal are omitted; the historical
notice makes the page's scope explicit. No Font Awesome Pro assets are included.

Asset manifest: `opendev-2020-assets.json`. All 50 referenced images were visually
inspected together and SHA256/size verified after R2 readback: 31 newly uploaded,
19 existing objects reused. SVG was checked for script/event handlers and external
references. No raw images or credentials are committed.

Four public first-hop redirects were rechecked and restored as 301 to
`https://openinfra.dev/legal/code-of-conduct/events`: OpenDev 2020, Berlin 2018,
Denver 2019 and Shanghai 2019 code-of-conduct pages. Their destination is the
current policy page; the migration does not assert it is the exact historical text.

SEO uses the production page title, a descriptive historical summary, canonical
www URL and existing OpenStack social image. The route is included in the rendered
SEO audit and offline sitemap review. Access protection and noindex remain enabled.

Validation is recorded after the final build/browser pass; route existence alone
is not full visual or editorial acceptance.

Final local acceptance September 15: normal Tina/Astro build passed; Astro check
257 files, zero errors/warnings and one existing hint; 100 existing tests passed.
Rendered SEO audit: 1,238 targets, zero inspection failures/issues. Offline sitemap:
250 candidates, 986 held. Final fresh Worker on port 4555 was visually reviewed at
1440 and 390 pixels; one H1, no code-block import artifacts, no horizontal overflow,
and all 49 inline images loaded (the 50th asset is the hero background). Local
browser image requests used page-scoped fulfillment from the verified private
files, so hosted R2 rendering is a separate deployment acceptance. Eight slash /
no-slash variants of the four policy redirects passed exact status/Location checks.

Hosted 5190b4e acceptance: desktop/mobile layouts, branding, committee and sponsor
images passed; one inclusion photo failed because its legacy `/summit/images/`
path is outside the media handler's supported roots. Corrected the content/registry
alias to `/assets/opendev/2020/inclusive.jpg`, reusing the same verified R2 object.
A follow-up check resolves all 50 image paths through the actual mediaKey contract.
