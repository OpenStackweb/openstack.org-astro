# Astro foundation demo — migration review

This is a protected demonstration of the proposed Astro implementation, not a production-cutover certification. Start at `/comparison/` for the staff-facing tour and readiness checklist. Production and the SvelteKit beta remain independent.

## Current checkpoint — September 17, 2026

Latest follow-through at `3355a8a`: the hosted Blog notice explains the separate
upgrade project, and Survey/analytics notices identify the required standalone
app. All four checked routes returned 200 and fit a 390px viewport. The staff
workbook Applications and decisions rows 8, 9, 107 and 108 reflect these decisions.
They remain unfinished applications, not completed ports.

Tina FAQ and footer repeated-list edits were saved on isolated draft branches,
verified in Git and the editor, then restored. PRs #5 and #6 are closed unmerged;
main content stayed unchanged. FAQ coverage includes question/topic addition,
reordering, removal, and invalid/duplicate anchor rejection. Footer coverage
includes link addition, keyboard reorder, removal and restoration. Release
creation's filename is natively disabled and follows the slug. An unsaved
26-credit test verified page-boundary reordering/focus, last-page removal and
empty-list controls. This does not establish the 10,000-credit maximum or a saved
round-trip for those contributor boundary cases.

Historical Summit RSS feeds are retired by JP's September 15 decision. All six hosted
feed URLs return HTTP 410; subscription links are removed, while archive pages and
readable news remain. See the [source assessment and decision](historical-conference-feed-assessment.md).

The protected preview no longer displays the global Astro review banner. Desktop and
mobile homepage checks passed after deployment 2d6ff2d. Application-specific notices
and Cloudflare Access/noindex remain. Hosted visitor sign-in, member lookup, token renewal and logout now pass, including
shared account state across pages and tabs. Production service integration remains separate.
The [authentication checkpoint](astro-authentication-port.md) records these limits.
The staff workbook also records the verified Community portrait fallbacks (14 cards,
eight initials fallbacks, no visible broken portraits). Missing photos remain editorial work.

Speakers is a deferred application, not a content-only page. The [source assessment](speakers-application-assessment.md) identifies existing Summit API profile capability, missing bureau search/contact equivalence, and the approved editorial deferral (retain or retire first; assess API reuse if retained). No backend port has been authorized by that assessment or implemented.

Astro is the selected staff demonstration target. The hosted PNG test and cleanup completed at `bfc355b` (Publish34904065933). The current SEO/browser follow-through is recorded in [browser review](browser-review-2026-09-14.md); its deployment evidence is recorded in the vault handoff. This checkpoint supersedes coverage totals in the historical sections below. Production cutover is not authorized or certified.

| Area | Current evidence | Still open |
| --- | --- | --- |
| Editorial source coverage | 238 imported page records; 186 included in Tina, 52 intentionally Git-only; no included record has an unrepresented top-level field or mismatched route. Dedicated homepage, banner, navigation, footer, industry/Software and shared-event collections are additional. | Fifteen sponsor pages, seventeen location/venue pages, two later rare historical pages nine election introductions and nine closed Summit workflow archives are intentionally Git-editable without Tina; see [archive editing](archive-editing.md). Source coverage does not prove nested editor or save parity. |
| Git CMS workflows | Hosted proof, Use Cases and App Dev text save→Git→deploy→restore verified. Hosted Highlights statistics and photo reorder/save/deploy/restore passed. Keynote title/day/description creation and removal round-tripped through Git; hosted creation, keyboard selection and restored-page acceptance passed. Photo creation, R2 media selection and keynote reorder passed as drafts; other saved permutations remain separate. | Hosted PNG upload→selection→save→deploy and release create/publish now pass, including cleanup. Known limitation: a stale editor can overwrite another saved edit; the user accepted this as low priority on September15 and retained direct publishing while subsequently selecting branch-and-PR evaluation. The paid isolated branch/PR/R2/preview/merge/restoration trial passed on September 17; staff saves on main now create draft PRs; preview dispatch is manual. See [trial acceptance](tina-branch-preview-plan.md). See [concurrency evidence](cms-concurrency.md). Remaining: collection-specific repeated-list/mobile checks. JP chose on September 17 to retain existing Papers as historical Git-managed HTML/PDF archives; new authoring and PDF generation will be decided separately. |
| Release announcements | Separate editorial collection and built unpublished-draft preview verified for copy, ordered credits, cleared fields and unchanged public listing. | Browser create/save/publish and cleanup passed. Structured releases/components stay Software-service-owned; collision/concurrency checks remain. |
| Media | 242 audited source pages: 1,200 R2-registry references, 56 public files, nine build files, 49 external references and no unresolved local references in that audit. CMS PDF byte ranges/HEAD/cache validation verified against real local R2; all89 tests and build passed. An earlier full remote readback verified 3,084 objects/3,145 aliases against size and SHA-256 with zero failures; see [integrity report](r2-integrity-audit.json). | Hosted CMS PDF upload through the file input, byte-for-byte readback and inline browser rendering pass; the map PDF also renders inline. Native picker interaction and broader PDF seeking remain separate checks. Later referenced-media uploads were individually read back; the earlier whole-bucket counts are not current totals. Storage integrity does not certify appearance or access for every asset. |
| Internal links | Recorded local audit: 245 sources, 742 targets, no source errors or404 findings; 166 migration-notice targets, 28 external redirects, six fragments absent from SSR, sixteen query redirects and one asset/app redirect. | Notices are explicit unfinished workflows. Six Marketing fragments passed browser tab navigation; external redirect retrieval and query follow-through are recorded in the browser review, without certifying destination applications. |
| SEO/Open Graph | September 17 rendered audit: 1,398 route/query targets, zero inspection failures or per-route findings, including all 100 Marketplace landing/category/provider pages. Four duplicate title/canonical groups are documented aliases. | Offline sitemap review has 283 candidates and 1,113 held entries; it is not an active sitemap. Editorial/translation review, sharing-image quality, real social crawlers and production indexing/cutover remain. See [rendered audit](seo-rendered-audit.json) and [sitemap review](sitemap-review.json). |
| Applications and identity | Software React island and development catalogue render inside Astro. Marketplace public browsing now covers seven API catalogue families, maps, training, provider specifications, reviews and video display, plus Tina page copy and shared labels. Videos and other deferred workflows retain notices. | Hosted Astro visitor login, member lookup, token renewal and cross-tab logout passed; the [authentication checkpoint](astro-authentication-port.md) records scope and remaining limits. Software production identity/data, Marketplace production service/data approval and write/admin acceptance, and Videos implementation decisions remain open. Placeholders are not functional parity. |

### Marketplace and publishing acceptance — September 17

At deployed `85c8462`, all seven Marketplace categories passed the hosted desktop
check for a single page heading, loaded images, uncaught JavaScript errors and
horizontal page overflow. All seven also fit the 390px viewport; the driver table
scrolls within its container and its Vendor sort works from the keyboard.

All 92 provider detail pages and both Tina rendering sections for each passed
hosted response/title checks (184 preview renders). These checks do not certify
every provider's visual design or every nested editor operation. Training's 25
course links and anchors, combined filters, reload persistence, schedule dates and
durations have separate browser acceptance. Training records include historical
and inconsistent source data; dates are not a claim of current availability.

The Marketplace help-link list passed saved addition, keyboard reorder, reload,
removal and restoration through [draft PR #4](https://github.com/OpenStackweb/openstack.org-astro/pull/4).
The PR is closed unmerged, main was unchanged, and the editor was restored to a
clean main session. API-owned records never enter those editorial changes.

Production comparison found 17 live training course entries, including Red Hat
CL010/CL210R/CL310R and OS100/OS220/OS250 absent from the configured API catalogue.
Production dataset acceptance is therefore demonstrably outstanding, not just a
configuration checkbox.
JP confirmed on September 17 that launch requires a fresh Marketplace data import
followed by another comparison against the live catalogue. The current development
snapshot is not the approved replacement dataset. Refresh the site snapshot only
after the owning service has the fresh data; reconcile missing records and relevant
provider/course details before signing off. Staff tracker **Applications and decisions**, row 51,
records this and the two EasyStack data-quality issues. Do not recreate missing
service records in Git to conceal the difference.

Rendered review HTML now requires revalidation; CMS/authentication pages retain
`no-store`, and hashed assets retain immutable caching. Hosted header checks pass.
See [deployment guidance](deployment.md#review-page-cache-policy) for the limits
of the brief old-response observations immediately after publishing.

### Remaining launch gates

- **Service readiness:** confirm Software and Marketplace production datasets,
  identity audiences/scopes, refresh operations, write permissions and service
  administration. Development browsing is not production service acceptance.
- **Deferred applications:** settle and implement the approved replacements for
  Videos, Speakers, the standalone User Survey app, mascot downloads, profile and licensing workflows. Their
  notices are intentional review aids, not completed functionality.
- **Editorial acceptance:** resolve staff decisions and remaining collection-specific
  editing checks. Rare archives intentionally remain Git-editable; do not count
  that accepted ownership choice as a missing Tina feature.
- **Blog cutover:** WordPress is separate, but its live header loads twelve legacy
  main-host scripts whose Astro paths return 404. JP approved retaining WordPress
  at `/blog/`, then moved the full upgrade to a separate project, with EmDash to
  assess alongside upgraded WordPress. That project does not remove the main
  cutover requirement for working blog routing and independent assets. Local theme
  preparation is preserved; no origin routing or WordPress deployment has changed.
- **Launch operations:** complete redirect/indexing/social-crawler acceptance,
  service dependency review and the production cutover/rollback plan. Production
  DNS and existing deployments remain unchanged.

The September 17 hosted known-route refresh at `b5a8177` contains 515 paths:
173 redirects, 279 rendered responses requiring scoped acceptance, and 63 explicit
notices, with no errors. Nine election introductions are now dated archives; the
PTG root and sixteen room aliases redirect to the Foundation PTG page.
The four newly native historical sponsor routes preserve all 231 ordered entries;
all 182 logo instances decoded in the hosted browser. Paris desktop and Vancouver
mobile were inspected. Hosted metadata checks confirmed distinct titles, correct
production canonicals, matching description/Open Graph text and retained noindex.
The older repository route artifact remains the dated `614ca5d` baseline; the
current hosted refresh is recorded in the vault handoff. SEO, asset references,
internal links, CMS coverage and static content accessibility were rerun at
`11c1003` against the corresponding built preview on port 4574. Asset references
include the restored Telecom and Enterprise backgrounds; the Enterprise video
anchors are now included in the link audit. These are scoped audits, not a whole-site acceptance certificate.

The [Foundation licensing assessment](brand-and-sponsor-assessment.md#existing-foundation-reuse-assessment--september-15)
identifies existing public policy/logo destinations but does not establish a
replacement signing service. Summit API legal-document reads still use the
SilverStripe `SiteTree` table in reviewed source. PHP retirement must not be
confused with permission to delete that database; document ownership, identifiers
and existing consumers need a separate migration plan.

September 15 static main-content accessibility follow-up covered all 220 imported editorial routes with zero unnamed-link or missing-alt candidates. The local server used the `bc8b41b` runtime; source metadata is recorded in [the audit](content-accessibility-audit.json). This does not cover CSS visibility, alt-text quality, keyboard behavior, contrast, media alternatives or application routes.

Standalone Playwright is available with the protected review session. Hosted PNG publishing and release creation passed; production comparison and broader browser acceptance continue. Local built-endpoint and source checks are explicitly separate evidence, not substitutes for the requested browser comparisons. Current detailed acceptance is in [Tina proof](tina-proof.md), [release announcement editing](release-announcements.md) and [SEO/Open Graph notes](seo-open-graph-notes.md).

The [staff workbook](editorial-review.md#migration-and-application-ledgers--september-15) now separates migration verification, deferred applications and editorial decisions. Its per-page source coverage rows must not be read as universal browser acceptance.

### Latest scoped Telecom acceptance

Through `22f233f`, the hosted Telecom hero, research band, five feature illustrations, report dialog, video thumbnails, Summit promotion and network divider have been reviewed against production/source. Desktop/mobile layout, report keyboard open/close/focus return, two restored R2 images and reduced-motion divider behavior passed their recorded checks. The report heading also passed unsaved Tina edit → live dialog preview → Reset, with original content restored and Save disabled. Newsletter delivery was not submitted or certified; video destinations remain deferred applications. The report's six-versus-ten contributor wording is flagged in Editorial review row13.

Tina media selection/clear labels at `83ac3da` passed hosted keyboard checks. Clearing the selection affects the draft only, and Reset restores it; the stored object is not deleted. The media-picker fix at `bc8b41b` passed hosted Enter/open, both Tab boundaries, Escape and Close dismissal, focus restoration and 390px mobile layout (no horizontal overflow). These checks do not certify every collection or every editor modal.

## Enterprise acceptance — September 15

The Enterprise hero, booklet choices, security band, guidebook cards, case-study
cards, Forrester callout, four story rows, testimonial and server divider have
received the scoped source/layout checks recorded in the browser review and vault
handoff. The four story entries now use separate existing Tina rows, preserving
all source text and links. Keyboard draft reorder and explicit Reset restored the
original order without publishing test content.

All three featured YouTube videos played on the protected hosted site at
`11c1003`, with advancing time and no media error. Closing a dialog unloads its
player; mobile cards fit without overflow. A Tina draft heading change propagated
to the video dialog, and Reset restored clean content and working playback links.
These fixed editorial embeds do not implement the deferred searchable Videos app.
Booklet component reconnection after DOM moves was also reproduced, fixed and
verified. Remaining saved list permutations, whole-page visual acceptance and
site-wide application/identity gates are not implied by these checks.

## Additional service boundaries

The [mascot assessment](mascot-application-assessment.md) identifies 69 published download packages with 750 file entries, while Software API currently models one primary file per mascot. Package ownership, visibility and asset parity remain decisions; this is not a completed download gallery. The [OpenDev sponsor archive](opendev-2020-migration.md) is now implemented under the approved dated-archive decision: Canonical and Avi Networks acknowledgments and the original nine-page prospectus are preserved; old purchasing and agreement actions are closed. Hosted page, logos and inline PDF were verified at `e28fe3d`. Mascot package integration remains a reviewer notice.

## Historical September 12 evidence

The sections below describe their dated observations, not current coverage totals.

## Content coverage

- All 208 previously imported editorial records render natively, including 48 previously unavailable structured templates. These include industry landing pages, summit highlights, sponsor groups, FAQs, venue maps, archival conference updates and scientific publications.
- Native Community, Learn, COA, supporting organizations and company profile templates retain the existing prepared content and service snapshots.
- All 19 research translations render with chapter navigation, illustration enlargement and language links. Existing generated PDFs were copied into content-addressed R2 objects; Git stores only the publication registry and artifact provenance. Rebuilding PDFs when content changes remains part of the future publishing workflow.
- Software is the existing React island and development dataset. Marketplace and Videos have detailed migration status pages.
- Known URLs outside the imported content set, schedules and identity/editor workflows still show review notices. The five unfinished local industry imports in the SvelteKit checkout were not silently copied or certified. In particular, Containers, Edge Computing, Telecom/NFV and Enterprise landing pages still need their final structured port. This prevents an imported raw body from being mistaken for production visual parity.

## Browser evidence

Chrome production and Astro homepage comparison: matching main heading, title, hero image, CTA, release banner and dark footer. Comparison strip and pending sign-in label are deliberate differences. Production was already signed in; Astro application sign-in is not connected.

Chrome Community comparison: matching hero, contribution choices and resource layout. Astro's project groups expand with native details; contributor links remain accessible. FAQ unmatched search returns an explicit empty result. Summit location map loads OpenStreetMap tiles, displays four Boston locations, and selecting a venue opens its popup. Research chapter links update the fragment and reader location. Use Cases filtering and media controls were checked in the previous release.

Some production navigation attempts timed out or produced blank screenshots before painting; DOM was re-read and usable visual captures obtained for homepage and Community. Do not infer full visual parity from route status or count. Continue the hosted screenshot/mobile checks after deploying this change.

## Verification

Astro check: zero errors/warnings. Build: passed. Local built route audit covers all 208 records, key demo routes, all research languages/PDF redirects and all registered public company profiles. It asserts server-rendered Software and Use Cases, one canonical and primary heading on key pages, and a real 404 for unknown URLs.

No CMS publishing, account edits or newsletter submissions were performed. Newly uploaded R2 objects are addressed by checksum, use new approved research paths, and do not change existing production or beta asset mappings.

## Hosted release checks

Initial expanded release: commit `08e6f12`, Worker `0dfc0f34-57b1-4879-8d80-c7bc722705b6`; CI run `34720436441` passed. Hosted Boston archive images load correctly and production screenshot comparison confirms the underlying hero/quote/statistics treatment. Astro deliberately retains the shared site header and an archival notice around historical pages.

At an actual 390px Chrome viewport, Community, Science, Marketplace status and the research reader had no horizontal overflow. Mobile menu expands. Historical missing project mascots were found and a fallback/lazy-loading fix added. The VMware guide has 61 readable chapters and its Download PDF action opened the protected R2 PDF in Chrome (`/assets/research-pdfs/4037-en-us.pdf`). All 43 registered public company profiles passed the local rendered-route check.

| Chrome comparison | Result / deliberate difference |
| --- | --- |
| Homepage | Matching title/H1, hero imagery, CTA, release panel and dark footer; review toolbar and pending application login are additional. |
| Community | Matching hero/resources and contribution choices; native expandable project groups replace the prior panel drill-down. |
| AI | Matching hero content/background; fixed the undersized quote typography and spacing. Production title was empty during observation; Astro supplies a descriptive title. |
| VMware migration | Matching H1; hosted images load and footer is dark. Research guide/PDF now stays on Astro. |
| Boston 2017 | Hero, quote, statistics and images are present. Shared Astro header and historical-content notice are intentional additions. |
| Science | Native structured layout and images; checked desktop content and 390px layout. Title wording remains a documented SEO alignment item. |
| COA | Astro content/title present; production metadata was readable but its body did not render in this observation. Full visual parity not certified. |
| Software | Hosted filter returns one Nova component and detail navigation opens Nova under the same Astro shell. Development data/sign-in limitation is visible. |

Final code release `78208514ea68565db1326c59330c8e7f04102ed5`, Worker `6dad39a3-0a0e-4b65-a03a-27fb0a4e096b`; validation run `34720683681` passed. Prior polish run `34720614007` passed. Hosted computed quote size is now30px and the reviewer toolbar links directly to the same production path. This evidence is a representative demo review, not a screenshot audit of every production URL.


### Selective asset migration policy — September 14

Migrate assets referenced by migrated pages, not the contents of the legacy Swift container. JP explicitly chose this approach to avoid carrying unused historical files into R2. Use a targeted lookup only when a referenced file is missing; no bulk container inventory or copy is needed. No Swift access key is currently required for this work.

The current `asset-reference-audit.json` covers 218 rendered sources and 11 directly linked local stylesheets. It records 986 R2 registry references, 54 public-file references, 10 build-file references and no unresolved local references. These are reference classifications, not a fresh remote-byte or full visual certification.

The 49 remaining external references break down as follows:

- 32 company-logo images on the homepage, AI and VMware pages: preserve the owning service's records and update path. A future cache or media migration must retain that ownership rather than turn logos into independent CMS copies.
- 14 Community profile images: preserve identity/member ownership, including Gravatar. These are not ordinary editorial image imports.
- Three third-party downloads: China Mobile's performance PDF at 01.org, the reference-architecture PDF at WordPress.com, and the Vancouver registration-code illustration at Dropbox. Review availability and intended destination individually before deciding whether a local archival copy is appropriate.

For each editorial asset batch, retain source provenance, inspect the actual image or document, preserve original bytes where possible, verify R2 upload/readback checksums, update only the intended references, and check rendered behavior. The eight Boston city-guide photos have passed local render, R2 checksum and hosted Chrome loading/visual checks. The city-guide card layout still differs from production; see the September 14 comparison below.


### R2 partial-file delivery — September 14

Reviewed `serveMedia` and added four HTTP-contract regression tests covering exact partial bytes (bounded, suffix and open-ended ranges), inline PDF headers, conditional cache responses and HEAD without body reads, validator mismatches, unsatisfiable ranges and an object changing between metadata/read operations. A regression initially failed because a later `If-Range` date incorrectly produced 206. The handler now requires an exact validator match; mismatches return the entire file. This follows [RFC 9110 section 13.1.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5), unlike the earlier-or-equal comparison appropriate to `If-Modified-Since`.

All 70 tests and the normal TinaCloud/full Astro build passed. These tests use an isolated bucket fixture, not hosted R2 traffic or Chrome PDF seeking; that live acceptance remains open. Existing private caching, inline registry policy and content-addressed R2 object ownership are unchanged. No production service or stored asset was modified.


### Hosted Boston city-guide comparison — September 14

Chrome verified all eight newly migrated photographs at the Astro city-guide URL. Scrolling the actual page triggered lazy loading; all eight completed with nonzero natural widths (691, 1600, 1400, 800, 596, 800, 826 and 550). Screenshots confirmed their displayed content and the Neptune image's embedded credit. Initial blank offscreen lazy images were not failed downloads. This closes the eight-image hosted acceptance gap, not complete page parity.

Production's Sights/Activities link scrolls to a section within the same long page; these are section links, not mutually exclusive tabs. The production screenshot shows three bordered cards per row, each with its image above its text. Astro currently uses one image/text pair per row, making the guide substantially taller. `Editorial.astro` applies that generic `.archive-landing .featured` grid. The shared `featured-guide-row` markup occurs in the Boston, Austin and Barcelona guides. Next implementation: scope the source-style card grid to that wrapper, then compare all three consumers at desktop and mobile. Source mobile rules in SilverStripe `summit/scss/cityguide.scss` also hide image wrappers below767px; assess this against production before changing the shared mobile layout. No CSS change is claimed in this checkpoint.

The Boston Samuel Adams Brewery website link points to a Barcelona basilica URL in the rendered archive. This joins the previously noted Stephanie's/Mike & Patty's mismatch as an editorial destination review item; no speculative replacement was made.


September14 city-guide layout follow-up: corrected the shared card wrapper for Boston, Austin and Barcelona. The sanitizer had been removing `featured-guide-row`, `featured-content`, address/title/link classes; these specific presentation classes are now retained, while arbitrary classes, inline styles and event handlers remain excluded (regression test). Scoped styles restore equal-width bordered desktop cards with images above text, source-like type sizes and compact listings. Boston retains its source mobile image-hiding variant; Austin and Barcelona retain a30/70 image/text split. Content JSON is unchanged.

Chrome on the final local build confirmed all three guides have aligned first-row card tops on desktop and no horizontal overflow. At390px all three fit; Boston hides image wrappers, Austin and Barcelona display97.5/227.5px image/text columns. Boston's Sights section link scrolls correctly and its mobile cards were visually inspected. All71tests pass; final Astrocheck216files zeroerrors/warnings/hints; normal TinaCloud/fullbuild succeeds. Initial browser checks caught sanitizer stripping and Astro scoped-selector issues, both corrected before publishing. Local R2 image delivery is not hosted R2 verification; the prior eight-photo hosted acceptance stands, but the newly published layout still needs a hosted screenshot check. Guide navigation icons/header styling and other full-page visual differences remain separate work.


September14 hosted card acceptance: Publish34847322480 for4503cd9 completed successfully after the Tina editor build. Chrome reloaded the deployed Boston guide, confirmed18 card wrappers and14px guide type, then followed Sights/Activities. Its screenshot shows the three bordered cards, image-above-text layout, R2 Fenway and Tea Party photos, compact listings and the same empty aquarium image area seen in production. Hosted Austin21cards and Barcelona14cards also have aligned first-row card tops and no horizontal overflow. This closes deployed desktop card-layout verification; local390px responsive checks remain the mobile evidence. No claim of full guide parity: production's section navigation is a blue rgb(41,171,226) bar with icons and source fixed-on-scroll styling; Astro still uses plain links. Source next-step reference: SilverStripe static.combined.scss4190–4255 and the city-guide navigation script. Preserve content/editability while restoring that presentation and navigation behavior.


September14 city-guide navigation restored: specific guide wrapper/link/icon classes survive sanitizing; icon i elements are aria-hidden while visible anchor labels remain accessible. Added the blue bar and original six Font Awesome4.4 glyphs using the unmodified SilverStripe WOFF2, locally served with its attribution/OFL text. Font SHA256 3c4a1bb7ce3234407184f0d80cc4dec075e4ad616b44dcc5778e1cfb1bc24019, 64464bytes. No CDN or client JavaScript is required. A settled production Chrome check after a section click showed position:static and navtop−4875px: the source fixed-class styles were inactive, so no sticky behavior was introduced. Native anchors preserve copy and destinations.

Normal TinaCloud/fullbuild and Astrocheck pass;72tests pass, including narrow-class sanitization/decorative-icon/link-name regression. Chrome local desktop Boston screenshot shows the bar and icons; Tab Food→Drinks has solid focusoutline, Enter gives#drinks with heading20px below viewporttop. At390px Austin6items each45.5px fit and display all6glyphs; Barcelona4items fit. Temporary viewport reset. Local R2 image placeholders do not indicate hosted failures. Hosted navigation acceptance remains pending deployment. ContentJSONunchanged.


Standing requirement, September14: eliminate Font Awesome Pro subscription dependencies. The imported guide font is the unmodified Font Awesome4.4 asset, covered by the [v4 SIL OFL1.1 font license](https://fontawesome.com/v4/license/), served locally with license text. A targeted scan of Astro source, package manifest/lockfile and public font notices found no Pro-package or hosted-kit references. This is scoped repository evidence, not certification of other ecosystem applications or dynamically supplied content.


September14 deployed navigation acceptance: aa1153d Publish34848262896 succeeded. Chrome hosted Austin shows all six original icons, bluebar rgb(41,171,226), correctly loaded first-row R2 photos and a visible Food keyboard-focus outline. Enter activates#food and places the section heading20px below viewport top. Hosted Barcelona at390px has four navigation items without horizontal overflow; viewport reset. New local asset audit218sources/11stylesheets has no source errors or unresolved local references:986R2,55public,10build,49external. The added public file is the locally hosted guide icon font. This confirms the scoped navigation change, not full site/CMS/application parity.

September 14 Use Cases result count: hosted Chrome reproduced `1 stories` when searching Workday. Added the singular `resultLabel` to the existing Git content document, retained plural `resultsLabel`, and used both in server and browser rendering. Older documents fall back to `story`. Normal TinaCloud/full build and Astro check (216 files, zero errors/warnings/hints) passed. Chrome against the built preview verified Workday→`1 story`, a nonmatching query→`0 stories` plus the existing empty-state message, Clear filters→`74 stories` and 74 cards. No catalogue service records changed. Hosted acceptance of this fix remains pending its deployment.

CMS scope gap: Use Cases page labels and editorial copy remain Git-editable in `src/lib/content/use-cases.json`, but the current Tina collections do not include this page. Add a dedicated editorial collection/live preview as follow-up; keep the story dataset separate in its existing catalogue owner. This small wording fix does not close that admin parity gap.

Archive metadata commit68c2c6e Publish34849708022 completed successfully. Its earlier local249-route audit and ten exact description/OG assertions remain scoped metadata evidence, not all-page hosted visual acceptance.

Use Cases admin gap update: f4d30c5 now supplies the Tina editorial collection and live Astro preview described in docs/tina-proof.md. Local heading/browse-label save and restore preserved other fields; hosted unsaved heading preview, settled filtering and Reset verified after successful deployment. Story catalogue ownership remains separate. Hosted publishing for this particular collection and complete media/reorder/concurrent-editor acceptance remain open.

September14 Use Cases hosted publishing acceptance closed: Tina text edit f441bf7 reached Git and the independently loaded hosted page after successful Publish34851766047. Restore e4e40b0 preserved every original content value (Tina JSON key order/newline normalization only), Publish34852022833 succeeded, and independent Chrome confirmed original heading with no test text. New uploads, complete repeated-mode editing and concurrent-editor acceptance remain separate open items.

### Hosted profile and Software acceptance — September 14

Chrome reconnected successfully using the existing signed-in session. Compared Canonical's Astro and production organization profiles side by side: the description, contributions and product prose match; Astro displays the logo while production showed a broken image in this session. Astro's loaded logo remains an external service/company asset, not an R2 migration claim. Header/announcement geometry and newsletter interaction differ; this is not pixel-perfect or full functional parity.

Hosted Software: filtering Dalmatian to Nova produced one component; its detail link opened Nova. Changing release to Caracal retained Nova and updated the back link to the Caracal catalogue. A nonmatching search showed zero components; keyboard Select All/Backspace restored all25 service cards. Browser automation fill('') twice left the old query intact; keyboard clearing succeeded, so this alone is not evidence of a React/site defect.

At a verified390px viewport (375px document width), Nova detail and Canonical profile fit without horizontal overflow; screenshots inspected and the profile logo decoded at200px native width. The viewport capability affected the active review tab, not older background tabs; initial background measurements stayed1448px and were excluded from mobile evidence. All temporary viewport overrides reset.

Both e8d7cce workflows succeeded, including protected Publish34858936739. No production records, CMS content or browser account settings changed. Software still uses a development snapshot; authentication, production datasets, video metadata freshness and broader mobile/accessibility acceptance remain open. Nova's project-update copy calls Victoria the latest release; this is inherited service snapshot content and must be resolved through the owning service rather than rewritten in the site CMS.

### Live legal-route ownership — September 14

A refreshed515-route inventory found151 notices before this change (126 redirects,238 rendered-unverified pages). Four content-like legacy records are already permanent external redirects on public production: Barcelona2016 and2020 summit code-of-conduct → https://openinfra.dev/legal/code-of-conduct/events; community code-of-conduct → https://openinfra.dev/legal/code-of-conduct; Foundation bylaws → https://openinfra.dev/legal/bylaws. Astro now preserves those exact301 first-hop destinations rather than showing migration notices or duplicating policy content.

Source checkout2172298743fe807a92758cf307059b69a7dba668: SummitSimplePage only inherits Page and provides a parent back action; LegalDocumentPage adds a CloudFile attachment field. These historical classes alone do not explain today's public redirects. Fresh no-follow HTTP observations verify all four301 targets. Chrome followed the Barcelona URL to the current Foundation code-of-conduct page at openinfra.org/legal/code-of-conduct. The upstream event-specific destination currently resolves onward to that page; Astro preserves the public first hop rather than selecting a different policy. No policy text edited.

Normal build passed; four trailing-slash and four slashless local requests matched301/exactLocation and proxy-disabled header. Refreshed inventory:130 redirects,238 rendered-unverified,147 notices, zero errors. Counts describe known route behavior, not full visual/editorial/application parity.

### Project mascot ownership gap — September 14

The generic `/project-mascots/` notice now explains the actual legacy catalogue, multiple download variants and copy-code controls. Reviewed SilverStripe2172298 and SoftwareAPI88616d2: Software API provides mascot CRUD/admin but associates one file per record; legacy dynamically discovers multiple files per project and caches them24hours. Package ownership/variants and visibility semantics require a decision; the existing Software thumbnails are not full-gallery parity. Recommended SoftwareAPI ownership with Astro gallery and Tina introduction; Git-owned catalogue remains an alternative. No service change or asset enumeration performed.

Normal build passed. Local slash/slashless routes return200 with one correct heading, specific findings and proxy-disabled header. The associated vault feature assessment records AppDev as a static-template candidate and Marketing as structured ordered CMS records, with remaining review requirements. Prior7c2027dPublish34860078980 succeeded.

### App Developer asset preparation — September 14

Chrome production `/appdev/` matches the430-line AppDevHomePage template's section headings. Read its controller, associated enterprise JavaScript and appdev-home.scss: the local controller adds tracking/styles and the template has four explicit YouTube video modals. Public page title is “OpenStack resources for app developers including OpenStack SDKs”. The hero retains the Scott Prudence photo-credit link. Page implementation remains pending; this is asset/source preparation, not a completed migration.

Ten referenced original images were downloaded individually (1,081,586bytes total), decoded and reviewed as a contact sheet: hero, conference background, guide cover, four video stills and three logos. The logos are explicit editorial template assets, not copied company-service records. Reviewed manifest: appdev-image-assets.json. The existing bounded image uploader now accepts only an explicit --appdev manifest option in addition to its established sets. R2 readbacks verified all ten sizes and SHA256 checksums; nine objects reused, one conference background uploaded. No bucket enumeration, source replacement or production changes.

Remaining port requirements: map all resource copy/links, testimonial, historical videos and Passport promotion into editable content; account for Passport-specific assets; retain attribution and native fragment behavior; compare desktop/mobile and test media controls and Tina round-trip. The inherited App Catalog and historical video claims need editorial review, not automatic copy rewriting.

### Native App Developer page — September 14

Added `/appdev/` as an editable industry-layout record: eleven sections preserve the production heading sequence, first-app guide and summit link, container resources, three customer-story logos, developer/app-catalogue links, four explicit video IDs, Mike Smith quotation and Passport promotion. Source is AppDevHomePage.ss at2172298, compared with the public page in Chrome. Native expandable video panels replace Bootstrap modals; the existing sanitizer uses youtube-nocookie. The source photo attribution is preserved. No searchable video service or production app data was added.

Eleven raster assets have reviewed R2 size/SHA256 readbacks, including the additional Passport background; eleven aliases added to the media registry. The8,073-byte Passport SVG is retained as a local source-controlled vector from the source checkout. Resource-card titles now honor their existing URL field. Scoped AppDev styles handle the Passport section and illustrative image sizes. Further hosted visual refinement remains necessary.

78tests passed and Astro check223 files reported zero diagnostics. The page initially exposed source indentation as Markdown code; corrected and verified zero main pre blocks. Local Chrome: matching production main heading sequence, one H1, no desktop overflow, first video panel opens with the expected accessible title/YouTube ID. Local remote-R2 loading is not certified. CMS source coverage now213 records,182 included,31 excluded, zero invalid included records. An initial test detected the newly invented hero.alt field; removed from the draft because the established hero is decorative and the field was unused. Updated the explicit industry-page cohort count12.

Normal TinaCloud build requires the new document registration to reach Git/index; standalone Astro build passed for local review. After pushing, run normal build again and verify protected deployment, hosted images/mobile and Tina edit/save/restore. These remain acceptance gaps, not a completed-page parity claim.

AppDev verification follow-up: normal TinaCloud/full build passed after d0776eb regenerated the schema lock. Initial905401c publish failed safely at schema validation; tinacms build (even local code-generation without cloud checks) did not update the committed lock. Running tinacms dev regenerated it, then the local server was stopped before the normal guarded build. Six schema/industry regression checks passed against the new lock; full78tests had already passed against the page implementation. No local-mode admin was deployed.

The rebuilt local internal-link audit covers219 sources/622 targets with zero source errors and no404 findings. It reports164 migration notices,23 external redirects awaiting follow-through,8 query redirects,1 asset/app redirect and the existing Tokyo #jp fragment gap. Hosted deploy and AppDev image/mobile/CMS save acceptance remain pending.

### Hosted AppDev images and layout refinement — September 14

Protected d0776eb Publish34862410873 succeeded. Chrome verified native AppDev deployed; all14 image elements (11 unique raster assets plus the SVG, with repeated still/logo) loaded with positive natural widths after scrolling sections. Local blank remote-R2 images were not hosted failures. Production/Desktop comparison found extra dark hero band and wide/small introductory copy; removed the editable overlay flag and scoped typography to the observed42px heading/20px paragraph,945px production text measure and1.43line height.

Passport background had loaded but inherited max-width200px/max-height150px and was behind the section. Scoped styles now remove those caps and isolate stacking. Matched the testimonial's pale background using its editable tone and reduced oversized portrait/spacing. Passport typography/alignment/button border are closer to production; complete pixel parity remains unproven, including icon shapes and sticky section navigation.

Normal build passed. Hosted prior-style mobile390px page has no horizontal overflow even with first video expanded. Local updated-style Passport at390px verifies background width390px, no max caps, isolated stacking and document width390px. Viewport overrides reset. New hosted-style appearance and Tina save round-trip remain pending.

### App Developer CMS and audit follow-up — September 14

Hosted Tina opens App Developer under Editorial pages with all eleven industry sections. Unsaved page-heading and nested ISVs-heading changes appeared in their respective preview headings; Reset restored both and disabled Save. A separate publishing check committed only the page heading (812c991); Publish34864407001 succeeded and a fresh standalone Chrome tab showed the changed heading. Restoring through Tina produced b68721d; a semantic comparison verifies every field matches the pre-test document. Restoration Publish34864666134 succeeded; Chrome independently confirmed the original heading on the standalone page. Tina serialization changed JSON ordering/formatting, not content. Repeated-list create/reorder/delete, media upload and concurrent editing are still separate acceptance items. The editorial list currently says search is not configured.

A refreshed local audit of the 920c8d2 build includes App Developer: 1,227 SEO route/query targets, no inspection failures or per-route findings under the existing checks; 219 asset-source pages and eleven local stylesheets, with 997 R2 registry references, 56 public files, ten build files, 49 external references and no unresolved local references. These are scoped checks, not complete SEO/accessibility or remote-object certification.

App Developer accessibility follow-up: the guide-cover and Vancouver presentation image links inherited empty alt text. Added descriptive link names in their CMS-managed HTML. Normal hosted-mode build passed; Chrome exposed both expected accessible link names. The static editorial accessibility audit now covers213 pages with no unnamed-link or missing-alt candidates. This does not certify keyboard behavior, contrast, media alternatives or the complete accessible-name algorithm.


### Marketing Resources migration preparation — September 14

Production Chrome confirms graphics and historical-software panels remain accessible on fresh navigation to `/marketing/#tab=graphics` and `#tab=software`, although only three top-level tabs are shown. Changing only the hash in an already-open production page did not switch panels; the migration should support both initial deep links and hash changes. Grouped sticker downloads were opened in Chrome. One source sticker-sheet link targets only `/assets/`; retain a clearly marked unresolved resource rather than inventing a working download.

The new `scripts/import-marketing-resources.mjs` converts supplied public HTML into a private structured draft: six event/promotion cards, nine collateral cards, ten historical release cards and seven graphic downloads; it preserves group labels, destinations, descriptions, video IDs and order. It does not export the private database or fetch assets. Run with the reviewed HTML path and a private output JSON path; expected cohort assertions stop silent markup drift. This is preparation, not a published marketing page or CMS parity claim. Positional draft IDs should become stable editor identities on first adoption; do not rerun over edited content.

54 unique image/resource URLs occur in the draft;45 map to the existing R2 registry. The remainder include six external/page destinations, the invalid assets-directory link, and two design files. Targeted HEAD requests for OpenStack-Sticker.ai and OpenStack-Hoodie.ai returned200 application/postscript,1236060 and1194502 bytes respectively. Bytes have not yet been downloaded/reviewed/uploaded. R2 registry presence does not certify remote bytes. A fresh collateral-browser attempt hit repeated runtime timeouts and reset the browser runtime; no claim of successful collateral deep-link visual review.


### Native Marketing Resources first implementation — September 14

Added `/marketing/` with a dedicated Tina collection and island preview. Six stable section anchors and32 structured cards retain public copy, link destinations, video IDs, grouping labels and existing order. Main navigation retains the three current tabs; an additional historical-resources disclosure makes the older deep-linked sections discoverable. Native hash handling supports initial `#tab=...`, ordinary anchor forms and subsequent hash changes, with keyboard tab navigation and progressive all-section HTML when JavaScript is absent. Browser behavior is not yet verified. Grouped downloads are directly listed with group labels rather than reproducing Bootstrap modals.

45 referenced assets use existing R2 aliases. The source's empty sticker-sheet directory destination is replaced with an explicit unavailable-resource explanation. The two original Illustrator files remain external pending selective download/R2 migration. All files are editorial marketing resources; no service catalogue data was modified. Tina exposes heading/introduction, section order/navigation, card fields, image descriptions, actions, video IDs and grouped resources. Stable IDs must be preserved after editing; the importer is not a synchronization job.

Standalone Astro build passed. Existing78 tests passed, and expanded Tina schema coverage verifies every new stored marketing field; Astro check229 files has zero errors/warnings and one importer deprecation hint. Local4510 HTTP200 contains six panels and32 cards, with zero static accessibility candidates under the existing main-content checker. Hosted-mode TinaCloud build/deployment, Chrome desktop/mobile/keyboard comparison, editor live preview/repeated-item CRUD, R2 readback for this cohort, and inherited broken links remain open. This first implementation is not full marketing parity.

Marketing follow-up: 339a0e2 protected Publish34866964757 succeeded. Chrome reconnected (new browser session) but hosted Access requested sign-in; user refresh requested, so hosted visual/editor acceptance remains pending. Local Chrome verified events tab selection, ArrowRight selection of Promote, historical disclosure and software panel selection. Software mobile width390/document375 fits; screenshot inspected, with local R2 images unavailable as expected. Main-tab mobile follow-up hit a transient evaluation deadline, excluded from acceptance; viewport explicitly reset. Public email links had been imported as Cloudflare protection URLs; importer now decodes the same addresses public browser JavaScript displays, and content retains normal mailto links. Full guarded build passed; local4511 HTTP200 verifies four intended email destinations and no encoded links. No CMS save occurred.

Marketing draft robustness: preview preparation now tolerates absent/null lists and partially filled section/card records without mutating the draft or saving fallback IDs. Existing valid identities remain stable even when a new draft item would otherwise collide. Unsafe action/resource/image URLs and malformed video IDs render inactive; Save retains strict identity/title/label/URL/video validation. Three focused tests cover incomplete nested drafts, identity collision, unsafe values and reorder acceptance/rejection. Full81 tests and normal hosted-mode build passed; Astro check231 files zero errors/warnings and one existing importer deprecation hint. Actual browser CRUD remains pending hosted sign-in, so tests are not a substitute for editor acceptance. Prior email-link fix1841332 Publish34867560768 succeeded.

Summit Highlights editor preparation (September 14): source-reviewed `SummitHighlightsPage`, `SummitKeynoteHighlight` and `SummitHighlightPic` at SilverStripe2172298743fe807a92758cf307059b69a7dba668. These model thank-you copy, manually published statistics, selected YouTube IDs, quote/attribution, ordered keynote cards/photos, release promotion and next-event promotion. New `tina/schema/summit-highlights.ts` covers every nested field in the four existing archive JSON records; focused source-coverage test passes. It is deliberately not yet registered: the Tina wrapper currently renders generic Editorial and must select SummitHighlights; strict preparation must tolerate incomplete drafts, accept the current CMS media delivery contract and validate on save before the allowlist is expanded. Counts remain182/213 editable and31 excluded. This is preparation, not editor acceptance.

Legacy capability requiring inventory validation: SummitHighlightsPage also offers an uploaded MP4 (`StatisticsVideo`) and poster as well as four YouTube fields. Current imported schema contains selected YouTube videos; this does not prove uploaded-video parity. The source's `getVideoDescription` calls YouTube directly, while statistics fields are editorial text; do not reinterpret the page as automatically calculated Summit API metrics. Existing next-event promotions can contain mismatched titles/dates and need editorial review.

Highlights preview foundation: the Tina wrapper now selects the same SummitHighlights component as the public route. Draft preparation tolerates empty/null list items and incomplete video IDs, leaves unsafe values inactive and does not mutate editor values; strict preparation still rejects invalid saved media/video values. CMS image support permits content-addressed PNG/JPG/WebP delivery, not PDF-as-image or arbitrary external images. Keynote event listeners now attach to a scoped custom element and disconnect cleanly for preview remounts. Full85 tests passed, normal TinaCloud build passed, Astro check233 files zero errors/warnings/one existing importer hint. All four built public archive routes returned200 with the Highlights renderer and one H1. CMS registration, beforeSubmit validation and browser CRUD/remount remain next; source coverage counts have not increased yet.


### September 14: external downloads remain unresolved

The three externally hosted downloads excluded from the R2 integrity result were checked separately with anonymous HEAD and bounded GET requests. [Recorded responses](external-download-review.json): China Mobile’s01.org performance paper now redirects to Intel’s general Open Ecosystem HTML page; the WordPress reference-architecture PDF redirects to a404 at ppb.technology; the historical Vancouver registration screenshot returns a Dropbox Error HTML page. HTTP200 alone would have incorrectly passed two of these links.

The first two links belong to the preserved service-owned story catalogue (China Mobile also appears in the homepage selections). Their source records were not rewritten. The Dropbox illustration is an archived FAQ link. No verified replacement was established, and a filename search of extracted local files did not find these names; that is not proof they are absent from every supplied archive. Locate approved originals/replacement destinations or agree to mark these resources unavailable before claiming full download parity. Browser inspection remains pending.

A separate unambiguous FAQ defect was corrected in its Git-owned body: the sponsorship address `summit@openstack.org` used an HTTP URL with the address as user-info. It now uses the same `mailto:` destination already used by the page’s contact section. No address, copy or other link changed.


Targeted replacement research found a [21-page SlideShare copy of the reference-architecture paper](https://www.slideshare.net/slideshow/openstackreferencearchitecturewhitepaper/67876898), with an October2016 cover naming Richard Haigh and Steven Armstrong and an uploader displayed as Richard Haigh. It is a plausible reading-copy candidate, not a verified original PDF or approved catalogue replacement. The normalized ppb.technology download path still returns404. A historical Galera mirror of the China Mobile PDF, discovered through its syndicated2017 announcement, now redirects to a MariaDB product page instead. Exact URLs and limits are recorded in [external download review](external-download-review.json). No service data or site links were changed by this research.

### September 15: early conference routes restored locally

Six historical ConferencePage landing records now render their imported overview/news/sidebar instead of notices. Latest local inventory:515 URLs,130 redirects,246 rendered-unverified,139 notices, zero errors. See the browser review for desktop/mobile evidence, inherited Atlanta date inconsistency, Git/Tina editing boundaries and incomplete RSS coverage verification. Atlanta hosted layout/images verified after8b90314. Original banners and date strips subsequently restored in1be1337; Paris desktop/mobile hosted acceptance passed.

September15 shared conference wrapper:43 imported child pages now inherit the six restored event headers, as the SilverStripe ConferenceSubPage/ConferenceNewsPage templates require. Six landings and these children use event OG images. Expanded local metadata audit1237targets0inspectionfailures/issues; route structure verified across43children, ParisFAQ visually checked locally1440/390. Hosted acceptance pending this release; neither all-page visual parity nor application completeness is claimed.

September15 redirect pass:29 production301 aliases restored, internal destinations stay on Astro. Three historical signed-in targets now show explicit application notices rather than404s. Store404/Austin2016partyDNSfailure are explained on their notices;15meeting-room redirects remain held for configuration review. Latest515-route audit159redirects246rendered-unverified110notices0errors. No claim that redirected application workflows are implemented. Speakers direction: assess Summit API reuse first, per JP; backend changes still require the resulting decision.

September15 source assessment: [brand agreement workflows and historical sponsor listings](brand-and-sponsor-assessment.md) are now explicitly distinguished from ordinary content. Replacement decisions are pending; review notices do not implement agreements, gated downloads or company administration.

September 15 Science CMS acceptance: saved card addition/content editing, keyboard reorder, removal and restoration passed on the isolated editorial branch. Git persistence and editor reload/rendered list were checked for each relevant state. Original content restored semantically; main unchanged. See [browser evidence](browser-review-2026-09-14.md#september-15--science-saved-repeatable-card-acceptance). Paid Tina branch/PR workflow remains separately blocked by its reproducible server failure.

September 15 Marketing CMS acceptance: isolated saved edit and restoration of the Rocky presentation's nested resource label passed Git and reloaded preview checks; R2 destination preserved. Disclosure and historical software section remained usable. Main unchanged. Saved nested-resource add/remove/reorder is still unverified; see the browser evidence log.

Marketing nested-resource follow-up: saved addition, keyboard reorder and removal now verified against Git and reloaded historical-resource preview. Final restoration confirmed by full parsed equality with main and clean editor. A rapid remove-plus-reorder attempt did not restore order; verification caught it and a separate settled reorder/save restored the original state. This closes the specific nested-list gap recorded above, not all Marketing interactions or paid workflow acceptance.

### Community Events destination — September 17

Public browser review found `/community/events/` returns 404, while `/events/`
resolves to `https://openinfra.org/community-events/` with the current Foundation
event schedule. Astro now maps the obsolete community URL directly to that
verified destination and its Tina-managed footer links there directly. This is
an intentional repair of a production broken link, not a copy of its 404.

The legacy event-submission, moderation, notification and import workflows remain
separate deferred applications. Restoring calendar navigation does not replace
them or establish that their old SilverStripe jobs can be removed.
