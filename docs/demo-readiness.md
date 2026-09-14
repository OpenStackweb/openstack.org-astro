# Astro foundation demo — migration review

This is a protected demonstration of the proposed Astro implementation, not a production-cutover certification. Start at `/comparison/` for the staff-facing tour and readiness checklist. Production and the SvelteKit beta remain independent.

## Current checkpoint — September 14, 2026

Astro is the selected staff demonstration target. Commit86e6dfa passed protected publishing34859476568. Software — Get Started has a Tina collection with local repeated-list editing and hosted unsaved-preview checks recorded below; collection-specific hosted publishing acceptance remains open. This includes release-announcement editing, preview routing, homepage release selection, mobile editor fixes and paginated keyboard-accessible contributor controls. Subsequent local changes require their own deployment verification.

The repository now has212 imported editorial route records, with181 in the Tina editorial cohort; dedicated homepage, announcement, navigation, footer, AI, VMware, shared event and Software overview collections are additional. Industry landings mentioned as unfinished in the September12 history below have since been ported. Counts establish coverage, not full visual, editorial or application parity. Current acceptance and precise browser limits are in [Tina proof](tina-proof.md).

The latest local internal-link audit inspects218 source pages and619 targets: no source errors or404 findings,166 migration-notice targets,20 external redirects still unverified,8 query redirects,1 asset/app redirect and1 missing server-rendered fragment (historical Tokyo New to the Summit #jp). The missing Japanese section belongs to the previously flagged uncategorized FAQ recovery decision; no hidden question text has been republished. These results are not complete-site functional certification.

Visitor authentication on Astro remains inactive. Software uses development catalogue data; production identity/data integration remains open. Marketplace/Videos and other deferred workflows display notices. Hosted proof-page text save/Git/deploy/restoration is verified. CMS R2 upload-to-save, release publishing, mobile and collection-specific repeated-list acceptance still have recorded gaps. The expanded local SEO metadata audit now covers1,226 route/query targets, including27 Software release snapshots and43 company profiles, with zero per-route findings or failed inspections. Duplicate titles/canonicals and broader SEO acceptance remain open. The separate static accessibility review has no unnamed-link or missing-image-alt candidates in212 pages. Release announcements now have a Tina collection and native preview integration; local browser creation, credit add/remove/reorder/save/reset and slug feedback are verified; hosted publishing acceptance remains open. See [release announcement editing](release-announcements.md), which distinguishes editorial announcements from service-owned structured release management. Production cutover remains unauthorized.

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
