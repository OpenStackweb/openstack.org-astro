# Astro SEO and Open Graph audit notes

Initial comparison, September 12, 2026. Carry forward the SvelteKit SEO audit; this is additional evidence, not a completed production audit.

- Comparison HTML and Worker responses are noindex/nofollow; Access protects the hostname, including assets.
- Canonical URLs point to www.openstack.org, not the comparison hostname. Review slash normalization and release query canonicals before production.
- Shared layout includes title, description, OG title/description/image and favicon. Several specialized templates still need their route-specific descriptions, OG images, Twitter metadata and structured data carried over; do not call metadata parity complete.
- Homepage social image is local. R2 media retains existing checksums, URLs and inline PDF disposition.
- Navigation/footer inherit some historical external HTTP links, tracking query strings and legacy branding/hosting credits from the source content. Review these centrally after editorial parity, not by ad hoc template replacements.
- No analytics/Cookiebot integration was enabled merely to reproduce a screenshot. Consent and analytics remain an explicit deployment requirement.
- A comparison notice with HTTP200 is not a migrated content page. `route-audit.json` distinguishes native editorial rendering from notices; production must not ship those statuses as completed pages.
- Asset-loading checks must distinguish below-fold lazy images from failed requests. Check actual network failures and scroll-visible rendering.
- The new software island must retain server-rendered names, links and descriptions even with JavaScript disabled; route audit asserts catalogue content in HTTP HTML.

## Use Cases native Astro port (2026-09-12)

`/use-cases/` now renders all 74 imported stories as HTML, with native browser filtering, grouping, hash links, grid/list controls and on-demand video. Page title and description match the existing Svelte migration. Shared Site layout now accepts a page social image and emits OG URL/type/site name/locale and Twitter card metadata. Preview stays noindex and Access protected; external social crawlers cannot validate cards until a suitable public audit environment exists. Story data remains the copied migration snapshot; no new API or CMS publishing backend was introduced. External story images still need the broader asset/availability audit.

## Foundation demo expansion (2026-09-12)

Structured summit/industry content, Community/Learn/COA/company profiles and research readers now render natively. Key-route audit checks one H1 and canonical. Research locale canonicals preserve `?lang=`, emit hreflang alternatives and article OG type; hero pages select their own OG image. All responses retain noindex and Access protection.

Production science title is “OpenStack for Scientific Research, HPC, HTC”; migrated content currently supplies “Science | OpenStack”. This is a recorded title-alignment item, not proof of an indexing defect. Other inherited page titles still need the comprehensive source-to-target audit. External historical links contain old tracking parameters; preserve destinations until audited. Research PDF artifacts are copied snapshots, not an active regeneration pipeline. Archived location maps use the established OpenStreetMap migration implementation; production map-provider behavior may differ.

Chrome production AI landing page returned an empty document title while its H1 and body were present. Astro supplies a descriptive title. Preserve this intentional improvement rather than copying the empty title. Final marketing quote correction restores 30px/40px desktop typography and 16px/24px mobile typography, source spacing and round arrow controls while retaining an explicit rotation pause button.

## Four additional industry landings

Containers, Edge Computing, Telecoms/NFV and Enterprise now have native structured records (212 total). Source class/template provenance is recorded in `industry-landing-provenance.json`. The local built audit passes; each new page has one h1, one canonical and no broken fragment targets. Source download dialogs are inline resource sections linked from the original calls to action. All 72 newly registered source images/PDFs were uploaded to private R2 by checksum.

Still review: desktop/mobile visual comparison for these four additions; resource/video title-to-link mismatches already present in the source; historical statistics such as “3x faster” and “96%”; heading hierarchy and legacy image alt text. The external edge calendar subscription and newsletter provider remain separate services, not SilverStripe endpoints to recreate. No newsletter submission was performed. Counts are rendering coverage, not full visual/editorial parity.

### September 13 — Edge homepage alias

Production `/edge-computing/` returns HTTP 301 to `/use-cases/edge-computing/` (verified by a live HEAD request). Added the same exact alias to Astro's redirect registry: the homepage's existing CMS link now stays on the review host and resolves to the native industry page. Descendant whitepaper paths are not covered by this redirect. Alias lookup and local-link conversion checks passed; no editorial copy changed.

### September 13 — internal content-link scan

A local built-preview scan of anchor hrefs on the homepage and all212 imported pages checked247 unique same-host non-asset URLs and found19 HTTP404 responses. `content-link-audit.json` preserves this **pre-fix baseline**, including referring pages. It does not cover externally rewritten www links, assets, fragments or full application behavior.

Known Summit schedule event routes are now explicitly classified as application migration notices by the Astro catch-all, using the existing schedule route parser. This is review transparency, not a replacement for schedule/event functionality. Remaining findings include three historical blog posts, `/brand/web-badges/`, `/events/opendev-ptg-2020`, and `/user-stories/`; verify source/production destinations before importing or redirecting. Production `/user-stories/` returned301 to `/user-cases` during this check, so do not assume a clean direct redirect to `/use-cases/` without examining the rest of that chain.

The route audit now rejects404s and generic notices for the212 imported content records. Reports record the actual checkout revision and dirty files, and explicitly limit the evidence to local HTTP coverage.

Follow-up production resolution: `/user-stories/` → `/user-cases` → `/use-cases/` (301 at both hops); Astro now redirects both aliases directly to the native destination. `/events/opendev-ptg-2020` → openinfra.dev/community-events/ → openinfra.org/community-events/; preserve the final external destination directly. The three historical blog posts also returned404 on production. `/brand/web-badges/` required login; source `WebBadgeDownloadPage_Controller::init` additionally checks the ReadGuidelines session flag. Treat that as a gated brand workflow requiring a decision, not an ordinary missing public content page (source2172298743fe807a92758cf307059b69a7dba668).

Chrome Edge comparison: production hero is a wide text column with two whitepaper actions in a narrower right column. Astro currently uses balanced columns but puts both actions in the left rich-text flow, with an empty right column. It also adds a section-label strip absent from production. This visual discrepancy remains open; inspect the original CMS fields/template and preserve structured editable actions when correcting it.

Edge hero correction: reviewed `EdgeComputingPage.ss`, `EdgeComputingPage.php` and `edgecomputing.scss` at the source revision above. The legacy headline and actions are template content, not additional controller/API behavior. Added a `resources` industry hero layout that renders the existing editable heroBody in a separate aside, restored wide headline text and action styling, and removed the extra label strip. Text and destination fields remain unchanged. Local Chrome verified the right-column actions; local R2 images are absent from the emulator, so hosted image/mobile verification follows deployment. This addresses the hero only, not full Edge-page visual parity.

### September13 — metadata baseline and translation language

Local HTTP metadata scan of212 imported records found186 empty meta descriptions (and therefore empty og:description values from the shared layout). `seo-description-gaps.json` lists the affected paths with titles and h1 counts. This baseline used the local b50b07c-era build; subsequent media-only changes do not affect its page metadata. It is not a source-CMS metadata comparison, and no descriptions have been fabricated. Review SilverStripe MetaDescription/source copy before filling these fields; preserve Git editability.

The shared layout previously hardcoded English for every translated paper. It now receives the prepared paper locale for html lang and og:locale; default pages use en-US/en_US. Added assertions for every configured paper translation to the route audit, alongside the existing alternate links/PDF checks. Full translated-copy quality, locale-specific social images, hreflang/x-default consistency and canonical query normalization remain separate audit items. Protected preview noindex behavior is unchanged.

Source comparison completed using the isolated openstack_full.SiteTree_Live database and private route-inventory path→ID mapping:180 of186 empty descriptions are also empty in the published source snapshot;6 have source MetaDescription values that were lost during import. Restored those six verbatim in Git content (Berlin2018 travel, Denver2019 sponsors/travel, Shanghai2019 travel, Sydney2017 travel, Vancouver2018 travel). The baseline report now distinguishes empty source values from restored values. This uses the supplied database snapshot, not a claim of current production editorial synchronization.

### September13 — industry hero comparison

Chrome desktop comparison of Containers, Telecom/NFV and Enterprise against production found layout/style losses. Reviewed source ContainersPage.ss/containers.scss, TelecomHomePage.ss and EnterpriseHomePage.ss at2172298743fe807a92758cf307059b69a7dba668. Containers now uses2:1 columns and omits the extra bottom breadcrumb strip; Telecom and Enterprise restore a dark backdrop behind hero text; Enterprise's existing booklet fragment link becomes a visible action button with its eyebrow above the headline. New presentation fields remain in Git JSON; default behavior of other industry records is preserved.

Still open: Telecom first section should have a blue background and asymmetric text/webinar columns, with its icon/button treatment restored; Telecom hero typography differs in weight/scale; Enterprise and Containers lower-page column widths and historical claims need further comparison. Do not treat hero corrections as whole-page visual parity. Download resources remain native inline sections, an intentional replacement for the old modal interaction.

Telecom webinar section follow-up: restored the source sky-blue background,3:1 text/action proportions, monitor icon and dark action button. The row model now supports a constrained content-action layout plus optional icon/action fields. Preserved the original text and Webex URL exactly. Source: TelecomHomePage.ss col-md-9/col-md-3 and fa-tv/container-download-btn. Historical December14 webinar copy/URL still needs editorial review; this layout restoration does not validate the old event registration service.

## September 13: broader route inventory baseline

Run `AUDIT_BASE=http://127.0.0.1:4395 node scripts/audit-inventory.mjs` against the current built local Worker. Evidence: [inventory-route-audit.json](inventory-route-audit.json). The c0f38f2 build returned 81 redirects, 238 rendered-but-unverified pages, and 196 explicit migration notices across 515 known paths. No HTTP errors in this inventory. This is broader than the 212 imported-editorial checks, but still not a crawl of every production URL. A notice returning 200 is unfinished functionality, not migrated content. ApplicationNotice markers are included in the classification.

Of the notices, 93 have source class RedirectorPage. These need target recovery and validation, not replacement page copy. Read-only production requests verified /foundation/ -> https://osf.dev/about, /foundation/staff/ -> https://osf.dev/about/staff, /foundation/board-of-directors/ -> https://osf.dev/about/board, /foundation/companies/ -> https://openinfra.dev/companies/, /events/ -> https://openinfra.dev/community-events/, and /superuser/ -> http://superuser.openstack.org/ (all 301). Following those destinations returned 403 to the automated client; browser verification remains necessary. No redirect rules were changed from this evidence alone.

Production also redirects /latest-release/ to /software/openstack-epoxy/, /queens/ to /software/queens/, and /wallaby/ to /software/wallaby/. The latest-release alias differs from the homepage Gazpacho announcement; flag for editorial review instead of assuming the alias is current. Internal destination behavior must be verified before enabling aliases on Astro.

### Redirect destination verification and restoration

Chrome followed the six Foundation/events/Superuser chains successfully. Verified visible About content, Foundation Staff, Governing Board, supporting Organizations, OpenInfra Community Events, and Superuser publication headings. Added exact 301 aliases directly to final destinations: /foundation/ -> https://openinfra.org/about/; /foundation/staff/ -> https://openinfra.org/about/staff/; /foundation/board-of-directors/ -> https://openinfra.org/about/board/; /foundation/companies/ -> https://openinfra.org/members/; /events/ -> https://openinfra.org/community-events/; /superuser/ -> https://superuser.openinfra.org/. The 403 automated responses were not evidence of dead destination pages. Child paths remain independently routed.

Full local build/check passed. Route audit now verifies every configured redirect's exact status and destination, with and without trailing slash. Known-inventory result after these six additions:87 redirects,238 rendered-unverified,190 notices.87 RedirectorPage notices remain. These redirects restore navigation only; no external site's editing/application capabilities have been migrated.

### Historical summit aliases

Restored15 exact301 aliases to existing native Astro editorial destinations; mapping and limits are recorded in [summit-alias-restoration.json](summit-alias-restoration.json). Production first-hop destinations and rendered Chrome pages were checked, including Berlin travel after its earlier empty snapshot. Both slash forms pass redirect assertions; following each alias locally reaches its expected native editorial page. Broader inventory:102redirects,238rendered-unverified,175notices.72RedirectorPage notices remain.

Preserved historical cross-year behavior: Boston2017 mobileapps -> Sydney2017, generic apps/mobile -> Shanghai2019, summit/mobile -> Denver2019, Vancouver2015 hotels -> Vancouver2018 travel, Vancouver2015 visa -> Tokyo2015 travel. These are editorial cleanup candidates, not silently corrected in migration. Old mobile application downloads, booking services and other external actions remain unverified.

### Foundation-owned brand and community aliases

Added9 exact301 rules documented in [foundation-alias-restoration.json](foundation-alias-restoration.json): event policy, OpenStack logo and download, trademark policy/restricted logos, community events, OpenInfra Days, Join and the Blueprint whitepaper. Production first hops plus Chrome final page content verified. Logos retain observedwww.openinfra.dev destination. Foundation content stays externally owned; these rules do not replace gated SilverStripe logo-rights/registration workflows elsewhere. No registration form submitted or production content changed.

Local build and redirect/editorial/paper/company route checks passed.515-route inventory now111redirects,238rendered-unverified,166notices, with63RedirectorPage notices remaining. No whole-site functionality certification implied.

### Summit landing redirects

Added7 production-verified exact301 aliases; see [summit-landing-alias-restoration.json](summit-landing-alias-restoration.json). Chrome resolved all destinations, including the interrupted Berlin2020 and schedule navigations on their existing tab handles. /summit/ and /conference/ preserve the current Vancouver2023 destination; Berlin2018 goes to the Foundation summit landing; Berlin/2020 aliases go to summit.openinfra.dev. No scheduleapp was implemented.

Build and configuredredirect/editorial/key/paper/company checks passed locally. Inventory118redirects,238rendered-unverified,159notices;56RedirectorPage notices remain. Two production destination failures remain deliberately unactivated: Berlin2018sponsors -> openinfra.org/summit-sponsor/ showsNOTFOUND; store -> shop-openstack.myshopify.com showsThisstorewillberightback. Those need an owner decision or a useful explicit unavailable notice, not a claim of restored functionality.

### Summit PDF aliases and R2 assets

Seven historical aliases now point to six reviewed public PDFs in the shared private R2 bucket. [summit-pdf-assets.json](summit-pdf-assets.json) records original URLs, filenames, sizes, SHA256 checksums, page counts and publication evidence. All seven PDF pages were visually inspected without rewriting the files. The documents are historical guides/maps; external links and travel recommendations inside them have not been revalidated as current advice.

Each remote upload was downloaded and checksum-verified before adding a runtime registry entry. Inline disposition preserves browser viewing. Local fixtures verified full response checksums, PDF Content-Type, inline Content-Disposition, byte ranges and HEAD for all six files with scripts/audit-pdf-aliases.mjs. scripts/upload-pdf-alias-media.mjs uses the openinfra Wrangler profile and refuses conflicting existing objects. No binary PDFs were added to Git.

All configured redirects and the 212 editorial route checks pass. Known route inventory:125 redirects,238 rendered-unverified,152 notices;49 RedirectorPage notices remain. These files restore historical downloads, not event applications or their administration.


September 13 — Survey review notices now distinguish application work from editorial content, including historical aliases and the navigation target /surveys/landing. They remain migration notices, not indexable replacement survey pages or functional parity. Native FAQ and published report routes retain precedence. The public 2026 landing still calls its 2022 report latest: flag for editorial review. Source assessment in the vault traces survey and reporting endpoints to SilverStripe, so they cannot survive retirement without a service decision.
