# Astro foundation demo — migration review

This is a protected demonstration of the proposed Astro implementation, not a production-cutover certification. Start at `/comparison/` for the staff-facing tour and readiness checklist. Production and the SvelteKit beta remain independent.

## Current checkpoint — September 14, 2026

Astro is the selected staff demonstration target. Commit0df2ac7 passed publishing34821215784. Software — Get Started now has a Tina collection with a verified local heading-save/preview cycle; repeated-list, mobile and hosted editor acceptance remain open. This includes release-announcement editing, preview routing, homepage release selection, mobile editor fixes and paginated keyboard-accessible contributor controls. Subsequent local changes require their own deployment verification.

The repository now has212 imported editorial route records, with181 in the Tina editorial cohort; dedicated homepage, announcement, navigation, footer, AI, VMware, shared event and Software overview collections are additional. Industry landings mentioned as unfinished in the September12 history below have since been ported. Counts establish coverage, not full visual, editorial or application parity. Current acceptance and precise browser limits are in [Tina proof](tina-proof.md).

The latest local internal-link audit inspects218 source pages and619 targets: no source errors or404 findings,166 migration-notice targets,20 external redirects still unverified,8 query redirects,1 asset/app redirect and1 missing server-rendered fragment (historical Tokyo New to the Summit #jp). The missing Japanese section belongs to the previously flagged uncategorized FAQ recovery decision; no hidden question text has been republished. These results are not complete-site functional certification.

Visitor authentication on Astro remains inactive. Software uses development catalogue data; production identity/data integration remains open. Marketplace/Videos and other deferred workflows display notices. Hosted proof-page text save/Git/deploy/restoration is verified. CMS R2 upload-to-save, release publishing, mobile and collection-specific repeated-list acceptance still have recorded gaps. The expanded local SEO metadata audit now includes seven release announcements:114 missing descriptions in249 routes, with zero failed inspections. The separate static accessibility review has no unnamed-link or missing-image-alt candidates in212 pages. Release announcements now have a Tina collection and native preview integration; local browser creation, credit add/remove/reorder/save/reset and slug feedback are verified; hosted publishing acceptance remains open. See [release announcement editing](release-announcements.md), which distinguishes editorial announcements from service-owned structured release management. Production cutover remains unauthorized.

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
