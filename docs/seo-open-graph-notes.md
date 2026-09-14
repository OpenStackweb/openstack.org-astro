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

### Internal link baseline — September 13

Run `AUDIT_BASE=http://127.0.0.1:4407 node scripts/audit-internal-links.mjs` against the built local preview. The first baseline is [internal-link-audit.json](internal-link-audit.json): 218 source pages, 619 distinct same-origin path/fragment targets, no source fetch failures. It found five HTTP404 destinations, 162 migration-notice targets, two fragments absent from server HTML, and 28 redirects requiring separate verification. Shared navigation is included; the source cohort is not the full site. Assets, external links and query-dependent targets are excluded. Client-rendered fragment targets require Chrome verification after hydration.

Triage from fresh anonymous public GETs on September 13 (not authenticated acceptance):

- Three historical `/blog/` links also return 404 on production: the October 2013 user survey article and the May/October 2015 Vancouver/Tokyo training articles. Their referring migrated pages are listed in the report. Locate an authoritative replacement/archive before changing editorial destinations.
- `/brand/web-badges/` redirects to SilverStripe login. This is a protected feature, not evidence of publicly exportable content; trace source permissions and agree its replacement before exposing anything. Authentication query strings are deliberately not recorded here.
- `/foundation/user-committee/` redirects 301 to `https://osf.dev/about/`, then 301 to `https://openinfra.org/about/`. The final direct HTTP probe returned403; the web reader returned the About page. Confirm in Chrome before restoring the alias as a verified navigation fix.
- The homepage links to `#openstack-services` in the Software React app. Missing server HTML alone cannot establish that this anchor fails after hydration.
- Tokyo New to the Summit links to `#jp`; inspect its source and browser behavior alongside the pending unpublished FAQ recovery decision.

The audit makes no production changes. These findings remain open and are not covered by the existing route-coverage pass.

Internal-link follow-up: Chrome verified the User Committee production alias reaches `https://openinfra.org/about/` with the About The OpenInfra Foundation heading. Restore a direct301 to that canonical destination, avoiding the intermediate osf.dev hop. Software `#openstack-services` is application selection state: the React hashchange listener selects the category, and Chrome confirmed switching to Operations tooling updates the URL and visible category. No DOM scroll target is required; retain this as a reviewed application hash rather than a broken anchor. Tokyo `#jp` remains unresolved with the FAQ recovery decision.

Web badges follow-up: `/brand/web-badges/` now has an explicit deferred-workflow notice rather than a404. Source review found a ReadGuidelines session check and a separate form action that sets it. The logged-out production redirect and intended future policy are distinct findings; no restricted assets or acceptance form are published. This is review coverage, not functional parity. A decision on preserving acceptance versus linking current Foundation brand resources is pending. Source assessment is recorded in the vault's SilverStripe feature migration document.

### Rendered metadata baseline — September 13

[scripts/audit-seo.mjs](../scripts/audit-seo.mjs) checks the local built HTML of 242 routes: the 212 editorial cohort, selected main landing and application routes, and all configured paper language variants. Run with `AUDIT_BASE=http://127.0.0.1:4410 node scripts/audit-seo.mjs`. Evidence is [seo-rendered-audit.json](seo-rendered-audit.json), built from the badge-notice revision0a4e5fa. The script records checkout revision and worktree changes; it does not independently prove build identity.

Findings:198 empty description tags and the same198 empty Open Graph descriptions. Several top-level landing pages omit a Layout description prop, and their content models lack a dedicated metadata description field. Existing empty legacy descriptions remain part of this larger rendered gap. Address explicit CMS-owned SEO fields for the main pages, preserving their preview/rendering contract; do not fill these globally with repeated boilerplate merely to pass a check. Historical descriptions need meaningful editorial review.

Within this cohort, all responses were200, with one nonempty title and H1, one canonical, matching OG title/description/URL, a syntactically valid absolute OG image URL, and matching document language/OG locale. Both meta and response-header noindex were present. No duplicate canonical values appeared among these exact requested routes. The report separately groups duplicate titles (e.g. event pages named Mobile Apps and Lunch Menus); review event/year disambiguation rather than treating all duplicates as incorrect.

Limits: no image retrieval, dimensions, social-crawler access, structured-data validation, production canonical response validation, full-site coverage, or social sharing certification. Preview images are on the protected preview origin and may be inaccessible to social crawlers. Production cutover must separately configure and verify indexing, canonical host, public share-image access, sitemap/robots behavior, and removal of review notices. Keep preview noindex controls enabled throughout this work.

Software overview metadata follow-up: added a CMS-owned plain-text description and supplied a summary derived from existing introductory copy. Local Chrome confirmed matching search/OG description tags, unchanged visible heading, and retained noindex. Updated242-route audit has197emptydescriptions (down from198). This closes only the Software overview's empty metadata; broader landing-page descriptions and editorial review remain open. Local additive schema build used skip-cloud-checks before pushing; CI must use the normal TinaCloud schema check.

Archive title improvement prepared: Austin2016, Barcelona2016 and Tokyo2015 lunch-menu seoTitle values now include city/year, using existing Tina-editable fields. Visible headings/body remain byte-for-byte unchanged. Production Austin Chrome title was Open Infrastructure Summit | Lunch Menus; local Chrome now shows Lunch Menus — Austin 2016 Summit | OpenStack with matching OG title and unchanged Austin Summit Lunch Menus H1. All three local HTTP checks passed. Vancouver2015 remains unchanged because its archiveEvent relationship is not yet covered by the current Tina collection. Full hosted build currently blocked by stale TinaCloud Software schema; these title changes have local Astro build verification only and are not deployed yet.

Historical blog links recovered: the three dated404 URLs have surviving undated article URLs, verified by exact headings in Chrome. Review notices now cover those old/current URLs and /blog/, linking to the current articles. This resolves the dead-end in the review experience; it does not migrate WordPress or settle blog hosting. WordPress-themed public assets were observed, so blog archive URLs, media, feeds, integrations and origin routing require a separate cutover assessment. Never deploy these www outbound links as a self-referential replacement on www. Unknown article URLs still404. Local Astro build, six HTTPnotice checks/noindex, unknown404 and Chrome notice/link check passed. Full hosted publishing remains pending TinaCloud schema reindex.


Industry CMS expansion: eleven existing routes retain their content, hero images, section anchors and layout via the same IndustryLanding renderer in Tina. Search/social title and description remain explicit editorial fields; committed page metadata drives the outer layout, not unsaved preview head changes. New section anchor edits can break incoming fragments; editor help text asks maintainers to preserve them. Existing missing descriptions and social-image accessibility findings remain open. No SEO audit completion is implied by editor coverage.

September13 industry descriptions: filled the five blank Tina-editable descriptions for Science, Forrester, Big Data, Virtualization Integration and Workload Portability from their existing page copy. Historical reports/case studies are explicitly described as archived; no dated cost figures or forecasts are promoted as current claims. Only description values changed in those records. Fresh local4419 rendered audit covers242routes, with192empty description/OG descriptions remaining (down from197); these five routes have no reported metadata issues. This is not complete SEO or social-crawler acceptance.

Audit transport correction: a stopped/unavailable preview previously produced request-failed rows but exit0. It now exits1 when requests fail. Verified against unavailable4419 before starting the new preview, then rerun successfully after startup. Missing metadata remains reportable editorial work rather than a blanket process failure. Astro preview may reuse an existing daemon on a different port; confirm its reported address/build and restart the owned preview when needed.

OpenStack for AI now has a dedicated Tina-editable description connected to the outer page Layout, derived from existing page topics. Like other metadata fields, the published document controls the page head; unsaved body preview is not proof of live head updates. The original heading still provides the page title. No social crawler or production indexing claim.

VMware migration landing now has a dedicated Tina-owned search/social description based on its planning resources, comparison, case studies and guide. Existing heading, source attribution, survey percentages and their copy remain unchanged. Marketing claims and metrics still need an editorial freshness review; CMS migration is not verification that every historical comparison remains current.

Shared footer follow-up: Mastodon’s configured rel=me is now preserved in rendered HTML (Chrome verified). This establishes the outbound identity link only, not completed reciprocal verification by Mastodon. WeChat QR access is restored; destination/account validity has not been authenticated or scanned. Existing historical tracking parameters on footer links remain a cleanup/audit item.

### September 13 — permanent footer URLs

Removed the inherited `_ga` query parameter from16 footer links. These were hardcoded analytics identifiers, not editorial destinations. Preserved link text, destination host/path, and unrelated query parameters. The footer remains Tina-managed. This does not certify destination availability or complete the190 missing page-description/OG-description items. Shared footer/navigation editor deployment d557d26 passed normal hosted schema/build checks; browser acceptance currently awaits refreshed Cloudflare Access.

### September 13 — eight editorial descriptions

Added concise descriptions from existing page copy for Analytics FAQ, Blog Authors Code of Conduct, Sample Member Profile, Compatible/Expertise/Powered logo licensing, Promote Customer Case Studies and User Survey FAQ. All eight are already in Tina's editorial collection. Analytics wording explicitly identifies the historical2015–2016 datasets. Only description fields changed; legal requirements, profile behavior, survey services and page bodies were not modified or independently certified. These values feed both description and og:description through the shared layout.

Follow-up content concern: the imported brand/logo-request/thanks page claims a ticket was automatically created. That claim must be checked against the eventual form/ticket service before cutover; a static confirmation route alone does not prove submission functionality. No replacement workflow was introduced in this metadata pass.

Logo confirmation follow-up: `/brand/logo-request/thanks/` now has an editable historical-workflow notice and explicit migration-pending SEO title/description. Original body retained. Chrome verified notice precedes the old success text. The reviewed public inventory maps its parent to RegistrationPage, so the separate OSLogoProgramForm source is not proof of an active intake endpoint there. Source assessment and intake-owner question are recorded in the vault. No form submitted, ticket created, private data exported or replacement service implemented.

### September 13 — archived menus and city guides

Eleven Tina-managed lunch-menu/lunch-guide and city-guide pages now have event-specific historical descriptions. Covered Austin2016, Barcelona2016, Boston2017 city guides and eight lunch pages spanning Vancouver2015 through Denver2019. Summaries come from existing copy and linked resource labels, not current travel recommendations. Vancouver2015 lunch SEO title now includes the city/year. Body content, destinations and event relationships remain unchanged. Asset download availability is a separate acceptance item; a description of a linked PDF does not certify its R2 object.

### September 13 — menu link names and wrong-event downloads

Added meaningful alt labels to10 image-only PDF links on Austin2016 and Barcelona2016 lunch pages. Barcelona Thursday/Friday incorrectly linked to Austin PDFs; both now point to Barcelona's four-page OSBCN-Lunch-Menus.pdf, whose pages3/4 were rendered and visually inspected to confirm those days. ProductionPDF/PNG requests returned200 with correct MIME/magic. R2 legacy/b99922808d75da7d1bded525eb633c3728c725397383a2851952a07678b8ffbc downloaded using openinfra profile and matched the production PDF byte checksum. An initial path-based R2 lookup was wrong: the media handler uses checksum keys, not legacy/original/path. No R2 object changed. Local built Chrome confirmed five named links per page and Barcelona destinations all within the Barcelona assets path. Schema checks/build pass. Full PDF accessibility and textual equivalents for unlinked menu images remain open; these labels name links rather than transcribing menu contents.

### September 13 — static content accessibility review

Added scripts/audit-content-accessibility.mjs and docs/content-accessibility-audit.json for212imported rendered pages. It reports unnamed href links and missing img alt attributes within main, handles explicit labels/image alt/SVG title and hidden markup, and excludes named-anchor-only elements. Tests cover image-link names, decorative images, explicit/ID-referenced labels and hidden content. It is intentionally a candidate report: CSS visibility, the full accessible-name algorithm, alt quality, focus/keyboard/contrast and non-editorial applications require separate browser review. Failed requests/non200/missingmain fail the run.

Initial scan found196unnamed-link candidates. Seven on Enterprise were image-only links in Tina-managed HTML blocks; used adjacent titles/captions as alt labels without changing destinations or introducing service data. Chrome verified the labels. The first rebuilt scan reports192candidates, including three remaining Enterprise story links in a multi-story block. Those three are being corrected and require a fresh rendered audit. Most remaining findings are historical sponsor-logo links and need source-backed company names and ownership care. All img elements having an alt attribute does not prove those alternatives are meaningful.

Final Enterprise follow-up: labeled the three remaining PayPal/Budd Van Lines/Time Warner image links from their adjacent story headings. Fresh build and separate preview audit now verify189total unnamed-link candidates and zero on Enterprise. The initial189/clear statement was premature; the intermediate report contained192/three and is corrected above. Six targeted tests and the final build pass. Link destinations and service ownership remain unchanged.

### September 13 — historical sponsor link labels

Reviewed source ConferenceSubPage at2172298743fe807a92758cf307059b69a7dba668: it extends ordinary Page with HideSideBar; its layout renders Content and separate parent sidebar includes. The three2012–2013 sponsor-list records are HTML, already Tina-editable, not a new sponsor-record administration feature. Visually inspected original public Portland HP/Rackspace/Ubuntu-supported-by-Canonical/RedHat logos. Added organization website aria-labels for their matching legacy hostnames in three page bodies and two existing shared-event resources fields. Onlyresourceschangedsemanticallyinthoseshareddocuments; no datasets or URLs changed.

The editorial sanitizer previously stripped aria-label on links; it now preserves that attribute. A regression test confirms the name survives while onclick is removed.22tests/fullbuildpass. Chrome Portland sponsor page confirms both body and shared sidebar link names. Fresh212pageaudit finds152unnamed-link candidates, down37from189. Remaining logo names and unrelated application/data ownership decisions are still unverified. Historical brand labels are retained, not renamed to current corporate owners.


### September 13: historical mobile-app landing metadata

Eight existing Tina editorial documents (Austin/Barcelona 2016, Sydney 2017, Vancouver/Berlin 2018, Denver/Shanghai 2019 and the Vancouver 2020 archive path) now identify their event/year in seoTitle. Descriptions summarize the original agenda-planning, device links and support contact as historical information. This does not assert that the 2020 event occurred or that the old apps/downloads remain supported. Body HTML, destinations, headings and archive notices are unchanged, verified by semantic comparison. No mobile application or Summit service functionality was implemented.

Full local Astro build succeeded; a fresh preview at4438 replaced the older4436 process. The rendered 242-route audit now reports165 missing descriptions/OG descriptions (previously170), and the generic Mobile Apps duplicate-title group is resolved. Chrome checked Austin’s retained archive notice and original device links. External app-store/APK availability, screenshot alt quality, full visual/mobile accessibility and social-crawler access remain outside this check. Four schema coverage tests and all26 tests pass.


September14 Software fragment fix: category navigation already used hash state, but the visible category section lacked the corresponding HTML id. SoftwareApp now passes the selected service-owned category slug through OpenstackComponents to its section. No catalogue data, API calls or auth behavior changed. Normal TinaCloud/full build62808 and Astrocheck94447 pass. Fresh preview4440PID35222; Chrome verified #openstack-services target and clicking Operations tooling changed both hash and target to #operations-tooling. Internal-link audit56679 now has one fragment candidate (Tokyo #jp), no404s and no source errors; full report retains explicit migration notices and unverified redirect classes.

### Archived FAQ and conduct descriptions

At source base `1a7ba4e`, reviewed the existing Tina-managed HTML for San Francisco 2012, Hong Kong 2013, Paris 2014 and Vancouver 2015 FAQ pages, plus Shanghai 2019's published FAQ questions. Added four missing descriptions and changed Shanghai's current-sounding invitation to an explicitly historical summary. Ten archived Summit code-of-conduct pages (2013–2020) now have dated descriptions drawn from their existing introductory text. Describing the 2020 archive does not assert that an event took place.

Semantic comparison verified that only descriptions changed in these 15 documents: bodies, policies, questions, answers, links, titles and notices are preserved. All remain in Tina's existing editorial collection. No hidden or uncategorized FAQ records were recovered, and no registration, travel or policy service was introduced.

Normal TinaCloud/full build and four CMS schema checks passed. Fresh built preview at port 4447 produced a 242-route rendered metadata report with 151 missing descriptions/OG descriptions, down from 165. All reviewed routes returned rendered HTML; the report found no other metadata issue classes. This is HTML metadata evidence, not browser visual verification, social-crawler access, image retrieval or full SEO acceptance. Chrome recovery and separate admin mobile QA remain pending.

### Rendered audit failure semantics

The SEO audit now exits unsuccessfully when a target cannot be inspected: non-200 status (including redirects), non-HTML content type, incomplete HTML document, or request/read failure. Previously only thrown request errors affected its exit status, so an HTTP500 could leave a superficially successful command despite being recorded in the report. `inspectionFailures` is now explicit in the report and console output.

Four response tests cover redirects/errors, JSON/PDF/text success responses, empty/fragment responses and complete HTML lacking editorial metadata. Missing descriptions remain review findings rather than failed inspections. Re-running against the verified port4447 build inspected all242 targets with zero inspection failures and151 missing descriptions/OG descriptions. This strengthens the evidence boundary without expanding the report's scope or certifying the rest of the site.

### Archived map and menu link names

At base274f9ce, four existing Tina editorial documents (Austin/Barcelona2016 summit maps, Tokyo2015 campus maps and menus) had13 image-only links with empty alternatives. Added link-identifying image labels from the adjacent headings and existing daily-menu resource names. Titles and descriptions now include event/year and historical context. Semantic comparison proves all other fields and body markup, including URLs, remain unchanged.

Seven schema/accessibility tests and the normal TinaCloud/full build passed. Fresh preview4448 was started after that build. The212page static accessibility audit now reports139 unnamed-link candidates, down13from152; the242route SEO audit reports147 missing description/OG values, down4from151, with zero inspection failures. These labels identify resources; they do not provide full text alternatives for complex maps or transcribe menus. Browser visual/keyboard checks and asset availability remain separate acceptance items, with Chrome recovery still pending.

### Archived contact and application link repair

The Austin2016 `sponsors-old` HTML contained three empty Cloudflare email-protection anchors immediately followed by correct named mailto links. Their encoded targets were decoded and matched the adjacent Summit/billing addresses before removing only the empty duplicates. A fourth visible `Contact us with any questions.` link encoded the same Summit address; its destination is now `mailto:summit@openstack.org`. No email was sent and historical sponsorship instructions were not changed. The Vancouver2015 travel-support page had `apply` outside an empty application anchor; moved that existing word inside without changing the destination or visible wording.

Both records remain Tina editable and retain their archive notices. Seven schema/accessibility tests, normal TinaCloud build and final Astro content build passed. Fresh preview4449 verified both named link destinations in rendered HTML and no remaining email-protection links on those pages. The212page static report is now135 unnamed-link candidates, down4from139. No new application intake, current program eligibility or delivery to those mailboxes is asserted; these are repairs to archived links. Chrome checks remain pending.

### Release announcement metadata and audit coverage

At83da1d3, the seven Git-owned release announcement records already contained descriptions, but the Software catch-all route passed only their title to Site layout. It now passes the announcement description too. The rendered SEO audit discovers these seven routes from the stored release slugs; they were absent from its previous242route scope.

Normal TinaCloud/full build and Astrocheck182files0/0/0 passed. Freshpreview4450 was started after the build. For each of seven announcements, rendered description and og:description were independently compared with the exact stored value and matched. Expanded249route audit has zero inspection failures and147 missing descriptions elsewhere. These numbers use a larger scope than previous reports. No announcement body, public contributor list or Software service data changed.

Source ownership remains important: reviewed SilverStripe SoftwareSubPage at2172298743fe807a92758cf307059b69a7dba668 inherits Page.Content; the existing SvelteKit release-parity ledger describes Git-owned announcements separately from API-owned releases. Astro still lacks Tina editing for these announcement records. That editorial port remains open and must preserve rich copy and public contributor names; it must not substitute CMS data for the Software API release lifecycle or automatically promote a release on the homepage.

## September 14 — archived selection-process descriptions

Added existing CMS description fields for eight historical selection-process pages: Tokyo2015, Austin2016, Barcelona2016, Boston2017, Sydney2017, Berlin2018, Denver2019 and the2020 Summit. Copy is grounded in each stored body. Berlin describes Forum brainstorming/proposal/scheduling guidance; other summaries describe their relevant Track Chair or Programming Committee and community-vote processes. All are explicitly archival; the2020 description does not imply the planned event occurred. Bodies, links, titles and navigation are unchanged.

Normal TinaCloud/full build and four Tina schema tests passed. A fresh built preview4458 verified all eight description and og:description values exactly match the CMS fields. The249-route audit completed with zero inspection failures and139 missing descriptions/OG descriptions, down from147. This does not validate the historical submission tools, forms or application workflows.

## September 14 — Community and Get Started metadata verification

Community's page template read a top-level description that did not exist. Added that summary to its Git content using the existing contribution, project/group and manager/ambassador sections. No other content or service references changed. Software Get Started's new Tina description was verified alongside it. Both rendered description and og:description match their Git values exactly. Community remains outside Tina pending its editorial/service-selector port.

Normal TinaCloud/full build passed. Fresh preview4461 audit:249 routes, zero inspection failures,137 missing descriptions/OG descriptions. A separate fresh Get Started build route audit passed212 editorial records, key routes, server-rendered React and unknown-route404. These are bounded rendering checks, not full functionality or production-cutover certification.

## September 14 — archive venue/map and shared sponsor link names

Added meaningful names to six image-only venue/map links on Portland2013, San Francisco2012 and San Diego2012 dates/location pages, using their adjacent venue names and map destinations. Added Nebula and Ubuntu Cloud link names to the shared San Diego archive resources and the historical sponsors page. Only alt/aria-label attributes changed; existing URLs, visible content and all other CMS values were preserved. These archive resources remain Git CMS content, not new service-owned sponsor records.

Seven accessibility/schema tests and normal TinaCloud/full build passed. Fresh preview4462 static review found115 unnamed-link candidates across212 pages, down from135 because shared resources affect several pages. Chrome verified the San Diego venue, map and both sponsor links by their exact accessible names. This does not certify the historical destination sites, image availability or full accessibility compliance.

## September 14 — redundant anchors and archive icon links

Removed two whitespace-only duplicate anchors: the logo inquiry mailto in Branding (the labeled email link remains) and the hands-on patch-review session in Sydney2017 categories (the labeled session link remains). Added accessible names to Twitter, Facebook and the adjacent “What to Expect at the Summit” video links on the Denver/Shanghai2019 archives. Existing targets and visible text were preserved. This is a link-label correction, not implementation of a video application or a check of the external video.

Seven relevant tests and normal TinaCloud/full build passed. DOM comparison preserved visible text, the set of link destinations and all non-body fields across four documents. Fresh preview4463 static audit:212 pages,107 unnamed-link candidates, down from115. Chrome confirmed all three Denver icon-link names. Full visual/keyboard/media accessibility and external destination availability remain separate acceptance items.


### September 14 — historical sponsor destination names

Named 94 image-only sponsor links in the Portland 2013, San Diego 2012 and San Francisco 2012 Git editorial documents using their recorded destination hostname plus “website”. This avoids inferring corporate identities or current ownership from old logos. Existing link destinations, visible text and other content fields are unchanged; the malformed San Diego Dell URL remains a review candidate. These are archived editorial bodies, not replacements for API-owned sponsor records.

Seven relevant tests and the normal TinaCloud/full build passed. Fresh preview4464 static audit covers212 pages and reports13 unnamed-link candidates, down from107. Chrome confirmed exact Dell and Transcend destination link names on Portland. Historical external destination validity, meaningful complex-image alternatives and full accessibility acceptance remain unverified.


### September 14 — archive photo links and inherited copy inconsistencies

Added accessible names to12 photo-credit/photograph links across11 existing editorial records. Photo-credit icons are named “Photo credit”; direct venue-photo links are named “View venue photograph”. Destinations and visible copy remain unchanged. Seven relevant tests and normal TinaCloud/full build passed; fresh preview4465 audit212pages leaves1 unnamed-link candidate (the malformed San Diego Dell destination). Chrome confirms both Vancouver2015 photo-credit links by name. This is a limited static candidate count, not full accessibility certification.

Production checked in Chrome September14: `/summit/vancouver-2015/about-vancouver/` itself displays “Come Join Us In Austin” and Austin promotional copy; its House Sharing section also mentions Shanghai before Vancouver. `/summit/vancouver-2015/details-and-updates/` links “More About The Host City” to `/summit/tokyo-2015/tokyo-and-travel/`. Thus these imported discrepancies are inherited production content, not demonstrated migration regressions. Preserve them pending editorial review; do not infer the correct historical replacement. Cross-event copy/attribution review remains an explicit acceptance gap.


September14 editorial decision: JP confirmed the Austin invitation is mistaken and authorized removing the Tokyo host-city link. Removed the two unrelated promotional blocks from the Vancouver2015 About Vancouver and Details & Updates Git editorial bodies, including their associated photo links. Preserved surrounding Vancouver content, news, locals and pass details. This intentionally corrects inherited production copy on the Astro review site; production remains unchanged. Other inherited mismatches (including Shanghai house-sharing text) remain recorded for review.


## September 14 — Election and Academy archive descriptions

Added descriptions to seven existing Git/Tina editorial records: the 2012 Board election and candidate information, 2020 and 2022 individual director elections, and Austin 2016, Barcelona 2016 and Boston 2017 Academy pages. Summaries use the surviving page copy and identify historical events. Austin Academy has no surviving body content; its description explicitly acknowledges that gap. Body content and all other record values remain unchanged, verified by semantic comparison.

The normal TinaCloud/full build and four schema tests passed. Fresh built preview4470 returned matching search and Open Graph descriptions for all seven routes. The 249-route metadata audit has zero inspection failures and130 missing descriptions/OG descriptions, down from137. This does not certify missing archive content, social images, structured data or crawler access; the review site remains protected and noindex.

## September 14 — San Diego 2012 Dell sponsor link

Chrome inspection of production `/summit/san-diego-2012/sponsors/` confirmed the original Dell anchor literally uses `www.Dell.com/OpenStack` without a protocol. The imported editorial record normalized that to an invalid OpenStack-hosted URL. Corrected the Git/Tina record to the intended absolute `https://www.dell.com/OpenStack` and supplied `Dell` as the logo alternative text, naming the link. This is a protocol/host correction inferred from the explicit original destination, not a newly selected sponsor landing page. External retrieval did not verify Dell's current response; retain that external-destination acceptance gap. No other sponsor destinations were changed.

Verification: four schema checks and normal TinaCloud/full build passed. Fresh preview4471 Chrome exposes link “Dell” with the corrected URL and named image. The static212-page content accessibility audit now reports no candidates in its two checked classes (unnamed links and missing image alt attributes). This is not comprehensive accessibility certification, verification of every alternative text, or confirmation that external links remain live.

## September 14 — Asset reference coverage inventory

New `scripts/audit-asset-references.mjs` inspects rendered image src and file-extension download links across218 editorial/landing routes. Fresh preview4471 yielded no source inspection errors:840 references have R2 registry entries,41 match public files,181 are external, and12 local references are unresolved by either store. None of those12 has a matching redirect in the current redirect registry. Four are visible Use Cases PDFs (China Railways, University of Edinburgh, Workday and LivePerson); the remaining eight are archive downloads/images. External references include48 still on www.openstack.org and119 on VEXXHOST object-storage hosts.

The private asset manifest contains a China Railways PDF under `assets/assets/China-Railways-Case-Study-2017.pdf`, marked unreviewed. This is a source lead, not authorization to publish unreviewed archive files or proof of a deployed object. Next: compare the12 unresolved references with current public destinations and archive entries, review public file bytes, then add verified R2 mappings. Also classify the production-host references before removing the old asset dependency.

The committed report lists exact source pages and URLs. Coverage excludes CSS backgrounds, srcset, lazy attributes, dynamic apps and download endpoints without extensions. Registry presence does not verify R2 existence, checksum, visual correctness or remote availability. Full asset parity remains open.

## September 14 — Use Cases PDF recovery

All12 unresolved local asset URLs still return public files through production's VEXXHOST redirects. Recovered the four Use Cases PDFs first: China Railways (4pages), Workday (12), University of Edinburgh (2) and LivePerson (2). All20pages rendered and visually inspected; no forms, JavaScript or encryption reported by pdfinfo. China Railways matches the provided archive checksum. Exact public source bytes were uploaded under new checksum-addressed R2 keys and downloaded again; all four sizes and SHA256 hashes matched. New registry entries preserve existing editorial links; no CMS field or production asset was modified. Source/provenance is in `use-case-pdf-assets.json`; rerunnable upload helper refuses conflicting bytes and aborts on unexpected R2 read failures.

The other eight recovered files are staged privately for review. Atlanta's sponsor prospectus contains an AcroForm, so preserve its original interactive behavior when reviewing it; do not flatten or fill it. No forms have been submitted. Asset dependency removal remains incomplete, including the48 production-host references in the prior inventory.

Normal TinaCloud/full build passed, followed by a successful Astro rebuild after adding explicit inline dispositions. Fresh preview4472 reference audit:218 sources without inspection errors,844 R2 references and8 unresolved local references (down from12). Hosted URL/browser PDF verification must follow deployment; local registry coverage is not that evidence.

Hosted follow-up: Publish34836811191 succeeded for4c3cbbd. Chrome opened all four PDFs at astro.openstack.org and screenshots showed the native inline viewer with correct content and page counts4/12/2/2. The browser navigation command timed out on each PDF, but subsequent screenshots confirmed successful loads; no unnecessary redeploy/restart was performed. Edinburgh retains its original internal PDF title `sdn-uoe-success-brochure.pages`; exact-byte preservation deliberately retains document metadata. This title can be considered in a later document-SEO review.

The48 production-host references are now classified in `production-asset-dependencies.json`:40 Community mascot PNGs return200image/png, seven mascot URLs return404 (Bifrost, Kayobe, Venus, Loci, OpenStackSDK, Placement, Skyline), and one Austin sponsor PDF uses the inherited typo `/ssets/`. The corrected `/assets/austin-summit/FINAL-Austin-Prospectus-April-2016-KW-11-11.pdf` responds200application/pdf through VEXXHOST, but is not yet registered locally. Next: preserve available mascot bytes behind a local media mapping without rewriting service-owned project records; retain explicit missing-artwork tracking for the seven unavailable originals; recover/review the corrected Austin PDF. Existing client fallback handles missing mascot images but does not remove production dependency.

## September 14 — Community mascot hosting

A separate source-URL-to-local-media map now translates the47 selected Community project images at render time. The service-owned project snapshot remains unchanged, including IDs, names, original mascot URLs and documentation destinations. Forty available PNGs were fetched from current public production paths; signatures/dimensions and a contact sheet were reviewed. Exact bytes are preserved, including Adjutant's existing pale placeholder graphic. The seven documented404 originals map directly to the existing local OpenStack logo fallback, avoiding broken network requests; replacement project artwork remains unresolved. Unknown future source URLs are not silently rewritten.

`community-mascot-assets.json` records sources and checksums; the uploader verifies R2 read-back bytes and reuses matching content-addressed objects. `community-media.json` is deployment mapping, not a new editorial or project-data authority. Direct preparation of the real Community document confirms47 selected projects,40local mascot paths,7fallbacks and unchanged source records. Astro check passed211 files with no diagnostics. Hosted image rendering must still be checked after deployment.

All40 uploaded/reused PNG entries passed remote R2 read-back size/SHA verification (Kolla and Kolla-Ansible share identical bytes). Normal TinaCloud/full build passed. Fresh preview4473 asset inventory:218 source pages, no inspection errors,884 R2 references,41 public files,134 external references and8 unresolved local references. The47 Community production-host references are eliminated from rendered HTML; one production-host Austin typo remains. This still excludes CSS/srcset/dynamic app asset coverage and does not claim full service migration or hosted browser acceptance of these newly mapped images.

## September 14 — Archived hotel downloads

Restored three public archive files: Paris2014 hotel map JPEG, Paris hotel amenities PDF (6pages), and Hong Kong2013 budget hotels PDF (1page). All seven PDF pages and the map visually reviewed; historical hotel contacts/prices preserved without presenting them as current recommendations. PDFs contain no forms, JavaScript or encryption per pdfinfo. Exact bytes uploaded to new checksum-addressed R2 objects and downloaded back with matching sizes/SHA256. `archive-hotel-assets.json` records provenance; registry preserves original URLs, PDFs explicitly inline. Normal TinaCloud/full build passed. Fresh preview4474 reference audit covers218 pages with no source failures,887R2references and5unresolvedlocalreferences (down8). Hosted browser acceptance of these three files remains pending deployment.

Community follow-up: Publish34837626255 succeeded for349c706. Chrome opened Code & Documentation → Compute; Nova and Zun images loaded from local `/assets/community-mascots/` paths with nonzero natural widths116/115. This is a representative hosted check, not complete visual acceptance of all40 images. The119 remaining VEXXHOST references have no exact derived registry path; they include service-owned profile/company images and editorial assets and require separate ownership-aware recovery.

## September 14 — Remaining local sponsor PDFs

Recovered five current-public sponsor documents: Atlanta2014 prospectus14pages, Hong Kong2013 prospectus13pages, San Francisco2012 agreement4pages and prospectus8pages, Vancouver2015 prospectus20pages. All59pages rendered and contact sheets inspected. Original historical pricing, sold-out marks, maps, unsigned agreement and Atlanta's reported AcroForm structure preserved through exact-byte copying; no form was filled, flattened or submitted. PDF form interaction itself is not certified. `archive-sponsor-assets.json` records public sources/checksums; the existing PDF uploader now accepts only the explicit additional `--sponsor-archives` manifest option. All five uploaded R2 objects passed read-back SHA256/size verification.

Registry entries preserve existing URLs and set inline PDF disposition. Normal TinaCloud/full build passed. Fresh preview4475 asset-reference audit covers218 sources without inspection errors:892 R2 references,41 public files,134 external references, zero unresolved local references in this bounded scope. This closes the12 originally discovered local-reference gaps, not all site assets: CSS, srcset, lazy attributes, app requests and remaining external dependencies are outside this result. Hosted PDF acceptance follows deployment.

Previous hotel deployment34838017456 succeeded. Chrome loaded the Paris hotel map at the Astro URL and confirmed image decode1011x1367. The two hotel PDFs still need hosted viewer checks.

## September 14 — Use Cases editorial image hosting

Recovered72current-public Use Cases images (14,889,501bytes total), decoded with sharp and visually inspected in three contact sheets. Exact JPEG/PNG bytes uploaded to R2 and downloaded back with matching SHA256/size for every object. New `use-case-image-assets.json` records provenance. The uploader limits concurrency to three independent checksum keys, deduplicates objects and refuses unexpected R2 read failures or conflicting bytes; only the reviewed manifest is accepted.

The Use Cases hero and story-card image renderer now use the existing `localMediaHref` allowlist with published registry entries. Original CMS document and story catalogue bytes are unchanged. No service record, image composition, crop or story metadata was rewritten. Type check passed213files; normal TinaCloud/full build passed. Fresh preview4476 rendered assertions confirm all72mapped images appear locally and no original URL remains in img src. The218source asset-reference audit has no inspection errors or unresolved local references:964R2,41publicfiles,62external references (down134). Hosted image/filter interaction acceptance follows deployment; CSS,srcset,dynamic applications and external-service image lifecycles remain outside this coverage.

### September 14 — hosted Use Cases image and gallery acceptance

Deployment e659937 completed successfully (Publish run 34838862274; Validate run 34838862280). In signed-in Chrome, submitting a Workday search returned its single matching story, List exposed story details/read-more, and the visible hero and Workday image decoded from local `/assets/` URLs. Clearing filters restored 74 stories. Alphabetical started with ATT, AdForm, Adobe; Location grouped by Africa/Asia; Industry grouped under Academic / Research / Government; Large scale returned six stories. These are observed UI outcomes, not a full data-correctness comparison with production.

The images below the viewport use lazy loading: an unrequested image with naturalWidth zero is not evidence of a broken asset. All 72 original uploads have CLI read-back checksum verification, but this browser check only certifies the exercised visible images. Full gallery image traversal, mobile visual review, and production interaction comparison remain open. The result label currently reads `1 stories` for a single match; record this minor editorial pluralization gap for a CMS-compatible correction. No CMS writes or production changes were made.

### September 14 — Austin 2016 sponsor PDF recovery

Recovered the 29-page prospectus, 8-page Tuesday community evening brochure, and 5-page draft sponsorship agreement from their public VEXXHOST URLs. All 42 pages were rendered and visually inspected in contact sheets; original bytes, sold-out markings, historical prices and DRAFT READ ONLY watermark are preserved. `docs/austin-pdf-assets.json` records hashes and provenance. The allowlisted PDF uploader supports `--austin-archives`; all three R2 uploads passed size/signature/SHA256 read-back verification. Registry entries request inline PDF display.

The sponsor archive contained both a valid external prospectus link and a broken `/ssets/` spelling. Four href replacements now point to the three local asset paths; every other editorial byte is unchanged. An initial rendered check caught that registry addition alone does not rewrite arbitrary external links in imported HTML; explicitly updated those CMS-owned URLs and rebuilt. The final normal TinaCloud/full build passed, and all three local hrefs appear with no old external hrefs or typo. Scoped asset audit: 218 sources, zero source errors, 967 R2 registry references, 41 public files, 58 external, no unresolved local references. Hosted PDF viewer checks remain pending deployment; these checks do not certify current sponsorship business workflows.

### September 14 — hosted archive PDF acceptance

Austin deployment 6a562e6: Publish run 34839810331 succeeded. Signed-in Chrome opened all ten previously pending hotel/sponsor PDF URLs in its native inline viewer, with visible document content and expected page counts: Paris amenities 6; Hong Kong budget hotels 1; San Francisco 2012 agreement 4 and prospectus 8; Atlanta prospectus 14; Hong Kong prospectus 13; Vancouver prospectus 20; Austin prospectus 29, Tuesday evening brochure 8, draft agreement 5. This closes their inline-opening acceptance gap. Local all-page visual reviews and R2 checksums are recorded in the corresponding manifests; this hosted check inspected the first-page render and viewer count, not every page or PDF form interaction.

Browser automation goto timed out while Chrome's PDF viewer loaded. Blank initial previews for the San Francisco and Austin prospectuses subsequently rendered; neither was recorded as success until actual content appeared. Document metadata sometimes exposes source-tool titles (`OpenStack Event Sponsorship Agreement MASTER-3`, `Sponsorship_Prospectus_Spring2012`, and `Microsoft Word - WATERMARK...`). Preserve original archival bytes for now; include PDF titles and embedded legacy links in the final document SEO audit. No forms were filled or submitted.

Remaining external asset ownership: `tina/schema/ai.ts` explicitly keeps company names/logos in the reviewed Summit snapshot, exposing only company-ID selections; `src/lib/server/openstack-for-ai.mjs` and `MarketingLanding.astro` resolve/render those records. Do not convert those logos to independently editable CMS data. Community IDP/Gravatar portraits similarly need their service ownership preserved. The remaining 58 external references are not 58 missing site files. The Tokyo venue image is a separate clear editorial recovery candidate; third-party city-guide images and linked publications require individual review.

### September 14 — broader rendered asset extraction

Asset audit now parses `img/source srcset` and `url()` values in inline style attributes and style elements, alongside img src and download links. It records extraction locations, resolves relative/escaped URLs, ignores embedded data/local fragments, and reports unparsed CSS URLs as source errors. Uses explicit dev dependencies on the already locked parse-srcset 1.0.2 and postcss-value-parser 4.2.0; package versions otherwise unchanged. Four regression tests exercise comma-containing responsive URLs, data URLs, quoted parentheses, HTML entities, CSS escapes/comments, script exclusion and malformed CSS. Full suite: 64 passed.

Against built preview 4478, all 218 sources inspected without errors: 978 R2 registry references, 47 public files, 58 external, no unresolved local references. The expanded scope discovers 17 additional unique references (six public backgrounds, ten R2 backgrounds and one responsive SVG), all already mapped. These counts supersede the narrower audit; they do not establish remote byte availability. Linked stylesheets, CSS image-set string candidates/imports, lazy data attributes and dynamically fetched application assets remain excluded. No production or content changes in this audit update.

### September 14 — Tokyo venue asset reuse and storage discovery

Tokyo Details & Updates had one external venue-image link. Retrieved and visually inspected its 63,004-byte public JPEG, SHA256 `4879788553c80cfc48766a7ac962ef9f2864dc9cdc64ada2b74979263408408e`; it exactly matches the already registered `assets/summit-travel-archive/summits/locations/tokyo-venue-bkgd.jpg`. Remote R2 read-back matched size/hash, so no upload or registry duplication was needed. Replaced only that URL in the CMS document, verified all other bytes unchanged; normal full build passed. Expanded audit: 218 sources, zero errors, 978 R2 references, 47 public files, 57 external, no unresolved local references. Hosted changed-page link check pending deployment.

Production Chrome still reports both Tokyo Summit Pass Timeline images complete with naturalWidth zero, using a legacy rackcdn.com URL. This corroborates the broken public image, but does not prove the original cannot be recovered from source/storage. Leave the current unavailable notice until recovery.

JP offered Swift credentials. A read-only request to the supplied public `www-assets-prod/` container with `format=json&limit=1` returned HTTP200 and a JSON array. No key is currently needed for inventory listing. Complete pagination and object comparison remain to be performed; public listing does not authorize exposing private metadata or copying unreviewed objects into the site.

### September 14 — Tokyo archive links and missing timeline investigation

Production Chrome and SilverStripe `summit/templates/Layout/SummitUpdatesPage.ss` reference rackcdn Tokyo-specific SVG and PNG pass timelines. Both HTTP URLs currently return404; HTTPS requests fail (not evidence of a404). Local packaged `pass-timeline.png` and `pass-timeline2.png` visually show Monday-based schedules and cannot substitute for Tokyo's Tuesday start. Targeted public Swift prefix lookups for the known filename/hash returned no matches; no broad listing was performed. The missing-image notice remains; recovery is not proven impossible.

Production and the imported record contain an inherited malformed lunch link with repeated `faq/summit/tokyo-2015/menus` segments. Corrected the CMS record to `/summit/tokyo-2015/menus/`, whose migrated content contains the relevant meal/location information. Also supplied the previously blank description from this page's dated archive content. Semantic comparison proves all other fields/body content unchanged. Normal full build passed; rendered description and og:description equal the CMS value, repaired href is present, malformed href absent, and destination returns200. The last full SEO report still measures130 blank descriptions; this one-page improvement has not yet been included in a fresh full report.

### September 14 — Tokyo archive description coverage

Added source-based, Git-editable descriptions to five remaining Tokyo archive records: landing, FAQ, new-attendee, sponsors and travel. The two FAQ-category sets are empty, so their descriptions explicitly state that no questions are published rather than promising missing answers. Sponsor description does not recast inherited audience figures as verified Tokyo statistics. Metadata-only semantic comparison passed; normal full build succeeded. All five rendered description and og:description tags exactly match CMS values. Refreshed 249-route SEO audit: zero inspection failures, 124 missing descriptions/OG descriptions (previous130; includes the prior Details & Updates change). These are still substantial editorial gaps, not a completed SEO audit.

Additional inherited content to review: Tokyo landing schedule copy says “OpenStack Summit Vancouver”; Tokyo sponsor introduction thanks sponsors for the “May 2015 OpenStack Summit”; its audience body refers to Vancouver and also labels metrics “November 2015 Vancouver”. Source records were not rewritten by this metadata pass. Some prior-event comparison content may be intentional, so clarify scope before blanket date/city replacement.

### September 14 — directly linked stylesheet asset audit

The audit now discovers stylesheet link elements and fetches each directly linked local stylesheet once, requiring HTTP200 and text/css. CSS resource URLs resolve against the stylesheet URL, with source-page provenance retained. External stylesheets are recorded but not fetched; failed local inspections enter sourceErrors. Added tests for stylesheet versus preload links and relative font/image URL resolution. Six extractor tests and the full66-test suite pass.

Against the existing built preview4481, 218 pages reference11 local stylesheets, all successfully inspected: one public fonts.css plus10 Astro CSS files. fonts.css adds six local TTF references, all present. Final counts:978 R2 registry references,54 public files,10 build files,57 external, no unresolved local references or source errors. This is file/registry coverage plus stylesheet retrieval, not remote R2 byte verification or computed visual acceptance. Nested CSS imports, external CSS contents, image-set string candidates, lazy data attributes and runtime app assets remain excluded. No app runtime/content changes in this verifier update. Previous03e709e Publish/Validate both succeeded.

### September 14 — Boston city-guide photo hosting

The eight externally hosted JPEGs referenced by the Boston city guide all returned200. Downloaded only those referenced files, decoded them with sharp, and visually reviewed their contact sheet. Original image bytes and embedded photographer credits retained; provenance/checksums/dimensions in `docs/boston-city-guide-images.json`. Existing image uploader now accepts the explicitly allowlisted `--boston-guide` manifest. All eight R2 uploads passed read-back checksum/size verification. No service-owned images or unrelated storage objects were copied.

The CMS page changed only eight image URLs; byte comparison proves other copy/captions/links unchanged. Normal full build passed; all eight rendered img src values are local R2 paths. Expanded audit:218 sources,11 local stylesheets,zero source errors,986 R2 references,54 public files,10 build files,49 external,no unresolved-local references. Before migration, Chrome confirmed the visible Fenway and Tea Party images decoded on the existing hosted page; offscreen lazy images were not classified as failures. Hosted rendering of the new R2 URLs remains pending deployment.

Separate inherited editorial issue noted: Stephanie's on Newbury has a Website link to mikeandpattys.com. The historical guide's venue/destination copy was not changed in this asset pass.

### September 14 — Boston archive description coverage

Added descriptions to ten Boston archive records: onsite COA, FAQ, sponsors, content categories, travel support, travel tips, travel/venue information, floor plans, Open Source Days and hotel cancellation policy. Historical exam/booking/application information is identified as archival; empty FAQ sets and unavailable policy text are acknowledged. Only description fields changed; source bodies and structured relationships are identical. Normal full build passed, and all ten rendered description/og:description values match the CMS documents. Fresh249-route audit:zero inspection failures,114 missing descriptions/OG descriptions (previous124).

Photo migration f8870ea Publish34843163661 succeeded. Hosted new-photo visual verification remains pending: Chrome transport returned Browser is not available, while supported diagnostics confirm Chrome running, extension enabled and native-host manifests valid. No alternate browser or authentication bypass used. Previous R2 byte verification/build href checks remain valid; do not count the interrupted Chrome check as visual acceptance.


### 2020 archive metadata and category-source finding — September 14

Added descriptions for OpenInfra TV, sponsors and Summit tracks based on their stored content. Only description fields changed; page bodies and sponsor records are preserved. All three rendered description and Open Graph tags match the CMS values. Normal TinaCloud/full build passed; the refreshed 249-route SEO audit has zero inspection failures and 111 missing descriptions/OG descriptions (previous114).

The tracks body contains escaped paragraph tags and doubly escaped entities. A fresh HTTP200 response from https://www.openstack.org/summit/2020/summit-categories-2/ contains the same literal markup. This is inherited production behavior, not evidence of a new Astro encoding regression. SilverStripe source commit2172298743fe807a92758cf307059b69a7dba668, `summit/templates/Layout/SummitCategoriesPage.ss`, loops Summit.CategoryGroups and Categories, displaying descriptions only when VotingVisible and ChairVisible are true. `summit/code/pages/SummitCategoriesPage.php` exposes header fields and removes the ordinary Content field. This reinforces the structured Summit ownership distinction: the migrated archive is a snapshot, not replacement category management. Keep a future API-backed category view/admin decision with the deferred Summit work; do not silently decode every imported body or create independent CMS track records. Chrome visual comparison remains pending reconnection.


September14 Austin/Barcelona metadata: added ten Git-editable descriptions for archived category/track guides, two empty FAQ pages, Austin sponsors and venues. Only descriptions changed; source bodies and relationships preserved. The Austin categories body mentions the Barcelona schedule, an inherited cross-event inconsistency retained for source review; descriptions avoid endorsing that schedule as Austin. Empty FAQ descriptions explicitly acknowledge no published questions. Full normal TinaCloud/build passed and all ten rendered description/OG tags exactly match CMS. Fresh249-route audit:zero inspection failures,101 missing descriptions/OG descriptions(previous111). Chrome reconnected successfully; hosted Astro homepage loaded through existing Access session. This restores browser availability, not full visual acceptance.

### Barcelona, Berlin and calendar instructions — September 14

Added ten Git-editable descriptions: six Barcelona archive pages (sponsors, hotel cancellation policy, travel support, travel tips, travel and venues), Berlin FAQ/sample letter/tracks, and Denver calendar sync instructions. Historical booking, application and pricing information is explicitly archival; empty question collections are described honestly. Only description fields changed, with all other document fields compared against the original. The normal TinaCloud/full Astro build passed; all ten built pages return 200 and render exactly one matching description and Open Graph description. Refreshed audit: 249 routes, zero inspection failures, 91 missing descriptions/OG descriptions (previously 101). This verifies metadata rendering, not visual parity, current application behavior or production indexing readiness.

Editorial review candidate: the imported Barcelona travel body includes Logan International Airport in Boston alongside Barcelona–El Prat. This is evidence from the migrated content at base ca4e654, not a fresh production or database comparison. Preserved pending source/editorial review; the new description does not endorse that airport entry. Denver calendar instructions explicitly use Boston examples and contain an Apple/Outlook wording inconsistency; historical text is preserved, not certified as working calendar integration.

### Denver venues and Paris/Atlanta archives — September 14

Added eight descriptions based on stored content: Denver2019 venues, Paris2014 format/passes, hotels, venue maps, visa information and video landing page, plus Atlanta2014 sponsorship and hotels. Booking, application and participation details are qualified as historical; no current availability or policy advice is implied. Paris video metadata describes the archive landing link, not completion of the deferred video application. Only description fields changed; all other values preserved by semantic comparison.

Normal TinaCloud/full build passed. All eight built routes return200 with exactly one description and Open Graph description matching the CMS values. Fresh249-route audit: zero inspection failures,83 missing descriptions/OG descriptions (previous91). Visual parity, structured-data coverage and production indexing readiness remain separate acceptance items.

### Hong Kong 2013 and Atlanta announcements — September 14

Eight additional descriptions cover the Atlanta archive's Paris save-the-date and visa instructions, plus Hong Kong sponsor/registration announcement, dates, format/pricing, hotels, closing video announcement and speaker submissions. Metadata describes historical event information, not current bookings, submissions or video-service readiness. All other fields and bodies remain identical. Normal TinaCloud/full build passed; eight HTTP200 routes render exactly one description and OG description matching their CMS documents. Fresh249-route audit: zero inspection failures,75 missing descriptions/OG descriptions (previous83).

Editorial candidate retained: `onine-video-now-available` has the title `Onine Video Now Available`. This is present in the imported record; title and URL remain unchanged pending editorial review. A title correction would not require changing the historical URL. Prior metadata batch0a50988 Publish34853030881 and Validate34853030796 succeeded.

### Portland and San Diego archive metadata — September 14

Added eight descriptions for Hong Kong2013 visa information, Portland2013 registration, dates/location, hotel announcement, agenda link, sponsor announcement and sponsor listing, plus San Diego2012 dates/location. Descriptions qualify historical rates and immigration information and describe external agenda links without claiming present availability. Bodies, original links and other fields remain unchanged. Normal TinaCloud/full build passed; all eight routes return200 with exactly matching description/OG values. Fresh249-route audit: zero inspection failures,67 missing descriptions/OG descriptions (previous75).

Source-review candidate: the imported Hong Kong visa body repeats the Chinese-language visa section. This observation is from the migrated record, not a fresh public/database comparison; no text was removed. Previous d121245 Publish34855218035 succeeded.

### San Diego and San Francisco 2012 — September 14

Added eight descriptions: San Diego sponsorship instructions/listing/agreement announcement/call for sponsors, speaker voting and submissions, and San Francisco headline sponsor announcement plus dates/location. The empty speaker-voting archive is explicitly described as having no available content, not a functional voting system. Sponsorship descriptions are historical. Original bodies, routes and all other fields are preserved.

Normal TinaCloud/full build passed; all eight rendered routes return200 with exactly one matching description and OG description. Fresh249-route audit: zero inspection failures,59 missing descriptions/OG descriptions (previous67). Prior884a26f Publish34855543652 succeeded. These checks do not resolve deferred application ownership or certify full visual/editorial parity.

### San Francisco, Shanghai and Austin archives — September 14

Added twelve descriptions: six San Francisco2012 event/registration/sponsor pages, Shanghai2019 sponsors/calendar instructions/venues, and Austin2016 mentoring, old sponsorship and landing pages. Only descriptions changed. Normal TinaCloud/full build passed; all twelve HTTP200 routes have one exact CMS description and OG description. Fresh249-route audit: zero inspection failures,47 missing descriptions/OG descriptions (previous59). Source inventory has30 Summit and4 other imported page documents without descriptions; remaining rendered findings require tracing other route/content sources rather than assuming all are these documents.

Editorial review candidates preserved: Austin landing copy mentions Barcelona in its city guide and pass introduction; Austin sponsors-old refers to the Vancouver contract. These are observations from the migrated records, not fresh production comparisons. New descriptions avoid endorsing the conflicting details. Prior3a6c1ed Publish34855888876 succeeded.

### Paper descriptions separated from visible subtitles — September 14

The paper route previously passed only the visible subtitle to Layout metadata. Nine paper/language versions have no subtitle, producing empty descriptions. Added an optional Git-backed `description` field to paper records and carried it through `preparePaper` to the route; existing records retain the subtitle fallback. Visible subtitles, chapter bodies, paper identity, language links and PDF ownership are unchanged. This is not a new Tina paper editor.

Descriptions added for the five language versions of Cloud Edge Computing: Beyond the Data Center (English, German, Indonesian, Japanese and Korean), the2018 User Survey,2020 annual report, Next Generation Edge AI/ML paper and Open Infrastructure for AI paper. Each reflects its stored chapter topics. Localized summaries are new editorial text; translator review remains part of final multilingual editorial acceptance.

All76 tests passed, including independent subtitle/metadata behavior, legacy fallback, invalid-type rejection and localized values. Normal TinaCloud/full build and Astro check222files passed without diagnostics. All nine rendered versions return200 with matching description/OG values and correct language tags. Fresh249-route audit: zero inspection failures,38 missing descriptions/OG descriptions (previous47). Prior87209bd Publish34856235616 succeeded. Social image bytes/crop, structured data, paper CMS workflows and all-page visual parity remain separate.

### Event notices and remaining general pages — September 14

Ten descriptions added for the March2020 COVID event update, two OpenDev2020 programmes, historical2012 election notice waiver, Barcelona2016 highlights, HongKong empty speaker page, Vancouver2015 landing/updates/placeholder, and Sydney2017 empty FAQ. Historical notices explicitly avoid current event, legal or health guidance. Empty pages are described honestly; schedules and video links are not represented as newly implemented applications. Other fields and bodies are unchanged.

Normal TinaCloud/full build passed. All ten routes return200 and render exactly matching CMS description/OG values. Fresh249-route audit: zero inspection failures,28 missing descriptions/OG descriptions (previous38). Prior08abec0 Publish34856689821 succeeded.

Additional imported-content review candidates: Vancouver details/updates includes October dates and Tokyo pass copy; Barcelona highlights promotion mixes a Vancouver2023 title with May2017 Boston dates/location. No automatic rewrite was made. New descriptions avoid those inconsistencies. These findings need source-backed editorial decisions and remain outside metadata-rendering acceptance.

### Sydney2017 and Vancouver2015 metadata — September14

Twelve descriptions added for Sydney sponsors/categories/calendar instructions/venues and Vancouver travel, Booth Crawl, call for speakers, discounts, ecosystem programme, registration, speaker-selection update and sponsor announcement. Sydney venue metadata explicitly notes unavailable floor-plan images. All other fields and page bodies are unchanged. Normal TinaCloud/full build passed; twelve HTTP200 routes have exactly matching CMS descriptions/OG descriptions. Fresh249-route audit: zero inspection failures,16 missing descriptions/OG descriptions (previous28). Priorb5b9036 Publish34857083440 succeeded.

Imported content candidates for source review: Sydney sponsor copy says October2017; Vancouver travel includes a Shanghai house-sharing paragraph. Descriptions do not repeat those questionable details. This is a review flag rather than a source/database-verified correction.

### Remaining Vancouver archive descriptions — September 14

Added descriptions to the last twelve imported pages with empty metadata: Vancouver 2015 sponsors, prospectus, travel support announcement/programme and two map pages; Vancouver 2018 sponsors, tracks, calendar instructions, two venue pages and visa/travel support. All other stored fields are unchanged. Descriptions explicitly identify historical content and do not present old travel guidance or deadlines as current advice.

Normal TinaCloud/full build passed. All twelve local rendered routes return HTTP 200 with exactly matching description and Open Graph description values. The 249-route audit has zero inspection failures and four remaining description/OG-description gaps: web badges, Marketplace, Videos and the Software components application. This closes missing descriptions for the imported editorial documents, not the full SEO or migration audit.

Editorial review candidate: the Vancouver 2015 travel-support-and-studentnon-profit-discounts announcement contains an April 3, 2014 discount deadline. The body is preserved pending source/editorial review. Prior d98e3a3 protected Publish run 34857426147 succeeded.

### Application notice and catalogue metadata — September 14

The catch-all layout now falls back to the existing application/review introduction when no paper or editorial description exists. Marketplace, Videos and web badges therefore describe their actual deferred state using the same text shown on the page. Software catalogue metadata derives the component/category and release names from the existing service snapshot and explicitly labels the development preview and pending production/shared-sign-in verification. Release announcements retain their own editorial descriptions. No catalogue records or CMS schema changed.

Normal build passed; Astro check: 222 files, zero errors/warnings/hints. Four rendered HTTP200 assertions passed, including exact notice copy, development label and matching description/OG description. The 249-route rendered audit now reports zero inspection failures and no findings under its existing checks. This does not certify all site routes, functional applications, social-image rendering, structured data, translated copy, indexing/cutover policy or complete SEO parity. The review site remains noindex. Previous 44d80bf deployment, Publish34858194749, succeeded.
