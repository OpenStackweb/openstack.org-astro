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

The expanded internal-link audit caught the shared header's skip link pointing to
an absent `#main` target on this new dedicated page. Added the main landmark ID;
keyboard skip-link behavior must be checked on the resulting deployment. The other
six fragment findings belong to Marketing's client-managed tab state, not OpenDev.


## Sponsor subpage assessment — September 15

The `/events/opendev-2020/sponsors/` subpage is not the same source family as the
four `SponsorsPage` archives already approved and migrated. At SilverStripe
`2172298743fe807a92758cf307059b69a7dba668`, `OpenDevStaticVancouverSponsorPage`
inherits `SummitSponsorPage`. Its controller/template and the parent establish:

- Editorial intro/alert, audience counts, venue copy and sponsorship instructions.
- Sponsor relationships through `Sponsor`, `Summit_SponsorshipType`,
  `SponsorshipType` and `Company`, ordered by the configured sponsorship tiers.
- Package/add-on and discount relationships, with availability controlled by
  sponsorship start/end dates.
- Prospectus/contract redirect actions; AJAX organization lookup; and a
  CSRF-protected purchase-order handler calling `registerPurchaseOrder` with
  `NewPurchaseOrderEmailMessageSender`. These are application responsibilities.
- CMS `onAfterWrite` updates related sponsor tier/link fields, so a page save can
  affect shared business records. Do not reproduce that behavior as Git content.
- The specialized controller requests Font Awesome Pro; it must not be imported.

Read-only production browser review found the historical three-step sponsorship
instructions, a Swift-hosted `YVROpenDevPTG-prospectus.pdf`, two EchoSign agreement
links and two sponsor acknowledgments (Canonical and Avi Networks). Canonical's
image did not decode; Avi's did. No form was present in this observed render.
The absence of a displayed form does not remove inherited controller actions.
No signing link, agreement-record spreadsheet or purchase endpoint was opened;
no submissions or emails were sent. Prospectus bytes are not yet verified in R2.

JP approved the dated archive on September 15: preserve the prospectus and
acknowledgments and close obsolete signing/purchase actions. The archive is now
implemented in `src/lib/content/pages/events-opendev-2020-sponsors.json`, using the
existing sponsor renderer. This rare archive remains directly editable in Git.

The local read-only database confirms published page 3356, Summit 28, and two
sponsors in tier/order sequence: Canonical (Headline), Avi Networks (Premier).
Their names, destinations and tiers agree with the current public page. The
published intro contains the prospectus and old signing steps; alert, venue and
additional sponsorship body are empty and audience display is off. No private
agreement records or purchase data were read. The isolated database was stopped.

The page summarizes the former three-step process without live signing, agreement
lookup, purchase or email actions. Its notice explicitly closes sponsorship and
identifies the planned Vancouver dates. The unchanged nine-page prospectus keeps
historical prices and contact details, with that limitation stated beside the
archive. All pages were rendered and visually inspected; pdfinfo reports no form,
JavaScript or encryption. The PDF was uploaded to R2 and SHA256/size verified after
readback; see `opendev-sponsor-assets.json`. Both sponsor logos reuse previously
verified R2 assets, including the original Canonical image in place of the broken
production transformation. Hosted rendering and PDF response acceptance follow
deployment; source import alone does not establish those checks.

Archive validation: normal Tina/Astro build passed, all112 tests passed and Astro
check reports zero errors/warnings (two existing hints). Fresh4562 browser review
at1440 and390px confirms one H1, both sponsor names/logos, no overflow, no main
form and no agreement/lookup/purchase links. Local logos were fulfilled only on
that browser page from the already hosted assets; final deployment is separately
verified. CMS coverage now220 generic records:186 Tina,34 intentionally Git-only.
SEO audit1253 targets reports zero inspection failures/findings; asset-reference
audit has no unresolved local references.
