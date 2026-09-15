# Production comparison and SEO review — September 14

Working review, not certification of every production page. Astro remains protected and noindex; production is unchanged. Base deployed revision was bfc355b. This pass uses Chrome against both hosts, plus built HTML verification for metadata changes.

| Page family | Chrome evidence | Result / follow-up |
| --- | --- | --- |
| Use Cases | Same production/Astro browser title, H1, introduction and hero artwork; both desktop screenshots inspected. Astro search for Workday returns one story; 390px mobile screenshot readable without horizontal overflow (375px content viewport). | Main experience preserved. Review strip, pending login, header spacing and some icon styling differ. Not every catalogue interaction or external story is certified. |
| Edge Computing | Desktop screenshots compared. Production/source use a 150px meeting icon; Astro rendered it at 380px. Source overview background is #EDF2F7. | Scoped illustration sizing and overview background restored. Search title restored from production. Two historical whitepaper URL aliases now route locally and preserve the language parameter. New build verification follows. |
| Science | Production initially painted blank, then settled; second screenshot inspected. Both retain radio telescope hero, scientific-research heading, book action and introduction. | Restored descriptive production search-title wording. Header height, hero spacing and icons remain minor presentation differences. |
| VMware migration | Both hero screenshots inspected: same artwork, heading, introductory claims, list and two actions. Production title is empty/URL-like during observation; Astro supplies a descriptive title. | Retain the improved title. Background crop and header spacing differ. Does not verify claims, linked apps or all lower-page sections. |
| Vancouver 2018 venues | Both production URLs expose the same two named venues/addresses. Astro also provides floorplan links, location cards and OpenStreetMap controls. Both imported records differ only in path. | Prefer /venues/ as canonical for both; retain both URLs. Different map provider/shared header are intentional. Map interaction/each floorplan require separate checks. |
| Austin 2016 track list | Production category and schedule variants both show Summit Tracks with matching subject copy; the category variant has extra schedule links. Imported bodies/titles match; back navigation and descriptions differ. | Prefer categories/track-list/ canonical; retain context-specific navigation. Do not redirect away or delete either record. |
| Boston 2017 highlights | Astro hero/quote screenshot inspected; production initially blank then loaded historical video/promotion sections and source navigation. | Historical promotions refer to Vancouver 2023 on production; Astro archive notice is intentional. This observation does not establish whole-page screenshot parity. |

## Technical metadata changes

- Software category canonicals include the resolved release. Historical catalogues no longer canonicalize to the unqualified current catalogue. Explicit-current and default-current URLs share the same release identity.
- Two verified archive duplicate pairs share preferred canonical URLs while retaining their pages.
- Paper hreflang uses the same English URL as its canonical and adds x-default; translated identities retain lang.
- Twitter title, description, image and image alternative text are explicit and match Open Graph.
- Basic WebPage/WebSite JSON-LD uses existing content; no invented event dates, ratings, author identities or current-event claims.
- Extended HTML audit checks those fields, valid JSON-LD identity, release canonicals and hreflang self-canonical consistency.

Policy reference: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) and [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions). Shared canonical values for proven duplicate content are intentional, not automatically audit failures. A protected noindex site cannot establish real social crawler rendering or production indexing readiness.

## Editorial approach

The 27 rare sponsor/venue archives are intentionally Git-maintained; [file map and instructions](archive-editing.md). Preserve historical facts, dates, downloads and attribution. Correct obvious technical defects with source evidence. Keep unresolved content questions in [editorial review](editorial-review.md) for the later staff sheet; do not put routine engineering work there.

## Verification for this change

Normal hosted TinaCloud + Astro build passed. Astro check: 246 files, zero errors/warnings, one pre-existing importer hint. All93 tests passed. Fresh built Worker4534 metadata audit inspected1,228 routes with zero inspection failures or per-route findings. Its only three duplicate canonical groups are the intentional current-release and two archive pairs. Direct HTTP check verified the old Edge paper alias returns301 to the local Japanese paper URL while discarding utm_source, retaining noindex/proxy-disabled headers. Four pre-existing full-query alias rules are now supported; targeted regression tests preserve repeated query values. Chrome briefly stalled during a later Marketing navigation, then reconnected successfully; that attempted Marketing inspection is not counted as completed. Hosted deployment verification follows separately in the handoff.

## Edge OpenDev follow-through

Revision `8b918a6` restores the black OpenDev section, 209px logo above its heading, background globe and video play overlays. Production Chrome screenshot and SilverStripe `themes/openstack/scss/edgecomputing.scss` establish the original treatment. The single referenced globe was copied to R2 with size/SHA256 readback verified; see [asset manifest](edge-background-assets.json). This supplements the earlier full R2 integrity audit with one newly verified object.

Tina now exposes a decorative background image and dark section tone. Industry image validation also accepts the existing hashed PNG/JPEG/WebP CMS media routes while rejecting traversal, PDFs and unsafe paths. All94 tests and Astro checks pass; the normal hosted-editor build passed after TinaCloud indexed the additive schema. Local phone layout has no horizontal overflow, but local R2 images were unavailable, so image acceptance requires the protected hosted build.

Hosted acceptance: Publish34915967128 and Validate34915967080 succeeded for `8b918a6`. Chrome confirms black background, visible R2 globe, loaded OpenDev logo and all six thumbnails/play overlays. Desktop screenshot matches the original section treatment; card dimensions/vertical spacing still vary. The hosted phone-width override did not take effect (the observed viewport stayed 1428px), so hosted mobile image/layout acceptance remains pending. The earlier 375px local check verified layout only, without R2 images. Viewport override reset. This is scoped section verification, not full-site pixel parity.

## Edge resources and mobile follow-through

Fresh active Chrome tab resolves the hosted mobile viewport limitation: OpenDev screenshot at 375px shows the R2 globe, logo and thumbnail/play overlay loaded, single-column cards and no horizontal overflow. Override reset. This supersedes the earlier failed attempt on an inactive tab.

The lower resource grid also lost its overlay positioning. Production screenshot confirms overlays centered on thumbnails; the same shared SilverStripe selector styles resources and OpenDev (`edgecomputing.scss:296`). Revision `85f0587` extends the restored overlay rules to this grid. Four article-only image links now use the adjacent article titles instead of “image”; a semantic comparison verifies only those labels changed, with destinations/copy preserved. Normal hosted-editor build passed. Publish34916303208 and Validate34916303160 succeeded. Hosted Chrome reload confirms centered overlays, all eight video thumbnails and four article thumbnails loaded, and descriptive article image link labels. No video-service acceptance is implied by thumbnail rendering.

Additional source-backed visual work remains: the “Why is OpenStack ideal” section should use the original gray background, the 2017 report strip should be blue, and resource subheadings have uppercase labels with horizontal rules on production. These are implementation tasks, not staff editorial questions.

## Edge section backgrounds and dividers

Revision `a1cfaae` restores the remaining source-backed section treatments noted above: gray explanatory section; blue 2017 report band with white text, report button and mobile stacking; resource subgroup headings with uppercase text and divider rules. Source: `EdgeComputingPage.ss:192`, `edgecomputing.scss:234–282`, and reused `enterprise.scss:1511–1548`. Only two JSON tone choices changed; semantic comparison confirms all copy, assets and destinations preserved. These remain existing Tina fields. Normal hosted build and Astro check passed (zero errors/warnings, one existing importer hint). Hosted acceptance follows separately; whole-site visual parity remains unproven.

Deployment: Publish34916730660 and Validate34916730657 succeeded for `a1cfaae`. Two subsequent production Chrome interactions timed out and reset the browser session; neither is counted as new visual acceptance. The earlier production screenshots and source comparison support the implementation, but fresh hosted desktop/mobile acceptance of this last band/divider change remains pending. No viewport override was active during these attempts.

Chrome recovery follow-through: fresh hosted Edge tab confirms the blue report band, resource heading dividers and loaded thumbnail overlays on desktop. At375px, report heading, statistic and button stack cleanly; the preceding gray explanation section is visible, and document width equals scroll width. Screenshot inspected, viewport reset. This closes the scoped band/divider visual check that was pending after the earlier timeouts.

## Learn — local release build versus production

Chrome reconnected using the existing browser binding. Cloudflare Access remains at its login screen; this pass used the independently built local site (`http://127.0.0.1:4538/learn/`) and public `https://www.openstack.org/learn/`, not the hosted Astro site. The local build includes the ead5229 letter fixes.

Desktop screenshots and DOM comparison confirm matching hero artwork, headline/subtitle, introduction, all eight resource card headings/copy/order and corresponding destinations. Local alt labels identify individual cards rather than repeating production’s generic Superuser label. All eight local card images loaded; document width1428 within viewport1443, no horizontal overflow at this size. Local lower-card screenshot inspected through Blog/News and newsletter. No form submissions or service writes.

Remaining differences: header spacing and inactive login; announcement copy/layout varies; production’s embedded newsletter email form is replaced with an external signup link. These are not certified as functional parity. Card links to Videos/Marketplace/Blog remain deferred notices where documented. Mobile and keyboard interaction are still unverified for this page; no viewport override was applied.

An initial production screenshot was blank while the DOM was available; a subsequent screenshot after loaded-state inspection rendered normally. Clicking the lower local heading on an inactive tab timed out; opening a fresh local tab and repeating succeeded. Neither incident establishes a website defect. Browser is usable for local/public comparisons; hosted Access sign-in is still a separate pending user action.

## Hosted acceptance after Access renewal

User renewed Chrome Cloudflare Access. Fresh hosted `/cms-proof/` DOM and screenshot show `OpenStack — Tina and R2 editing proof` and the original introduction, exactly matching the restored Git document. No test marker remains in those fields. This closes the pending cleanup view; it does not fix the separately verified concurrent stale-save overwrite. Fresh hosted COA and Supporting Organizations document metadata confirms the new nonempty descriptions equal Open Graph descriptions, correct headings/titles render, and `noindex, nofollow` remains. Hosted access is working again.

## Map PDF and Marketing hash navigation — hosted Chrome

`/openstack-map/` redirected to the Astro-hosted `openstack-map-v20260401.pdf`. Navigation reported a timeout, but subsequent tab inspection and screenshot showed Chrome’s inline PDF viewer displaying the complete one-page OpenStack map, version2026.04.01. This closes the hosted inline-delivery check; no download or print action was taken.

All six Marketing `#tab=` links (collateral, events, get_involved, graphics, promote_product, software) were opened in hosted Chrome. Each selected exactly its matching visible content panel. Clicking Get Involved from Graphics updated the hash and selected tab and displayed its content. These six server-fragment findings are explained by verified client-side category navigation, not broken anchors. No forms or CMS records were submitted.

Tokyo new-attendee `#jp` was different: hosted and production DOM both lacked that target; production showed no FAQ topics. SilverStripe SummitQuestionsPage.ss renders categories supplied by QuestionsCategories; imported FAQ categories are empty. Removed only the dangling Japanese see-below link from the Git body. Bilingual title, archive metadata and no-questions notice remain. Normal build passed; fresh Worker4539 confirms HTTP200, no `#jp` link and retained title/empty-state. Hosted correction still awaits deployment verification.

## Marketing keyboard and search interaction

Hosted Chrome: Marketing ArrowRight moved Get Involved→Navigating Events; End moved to Promote Your Product; ArrowRight wrapped to Get Involved; ArrowLeft wrapped back; Home returned to Get Involved. Active focus and URL hash matched each selected tab. Hosted header search submitted `nova` with Enter, displaying10 results; Next opened page2 with10 results and a Previous link. This uses the existing public search service and is not proof that unpublished/new Git content is indexed.

Search results exposed a demo clarity gap: video records looked available even though their destination is a migration notice. Added a small status line for local `/videos` and `/marketplace` result paths only, leaving service-owned titles, snippets, counts, ordering and destinations intact. Normal build passed. Fresh localWorker4540 GET rendered10 Nova video results with10 labels; Chrome DOM and screenshot verified layout. Marketplace path classification is source-verified, not exercised with a live marketplace-result query in this pass. Hosted labels await deployment.

Prior Tokyo correction is deployed: fresh hosted DOM shows the bilingual heading and empty-FAQ notice without the dangling Japanese link. An initial evaluation timeout was followed by a successful DOM snapshot; no browser restart was needed.

## Search-label follow-up and browser transport

Search-label deployment86c9031 passed Publish/Validate (34920132744 and34920132713). Local built-response checks with live public search queries verified Marketplace labels: Rackspace returned2 Marketplace and2 ordinary results; public cloud returned9 Marketplace and1 ordinary result. Ordinary results did not receive the Marketplace label. This closes the prior source-only Marketplace classification check, not hosted visual acceptance.

Shared-header keyboard check did not complete: Chrome automation timed out and its runtime reset. Bootstrap then reported Chrome unavailable, browser discovery returnedempty. Diagnostics confirm Chrome running, extension installed/enabled and native-host manifests correct. Requested permission for the documented fresh-window recovery; no window opened, no fallback browser used. No navigation behavior defect is inferred from the transport failure.

## Responsive header and desktop keyboard acceptance

After approved fresh-window recovery, Chrome works again. Hosted Learn at375px showed no horizontal overflow; Menu opened/closed and aria-expanded followed. Production Learn at the same375px width also fits, but exposed an Astro header mismatch: the desktop search form used `.nav-search` while the mobile hiding rule still targeted `.search`, pushing Menu onto another row. Corrected the mobile rule at600px and below, with a Search link inside the expanded menu so the function stays accessible.

Normal TinaCloud build passed. Fresh localWorker4541 at375px: logo top225/height35 and Menu top223.5/height38 share a row, scrollWidth360 within375, desktop form hidden. Open Menu→Search is visible and navigates to `/search/` with its heading. After resetting viewport, mobile Search link is hidden and desktop search input visible. Hosted mobile correction awaits deployment.

Hosted desktop: Enter opens Events; Escape from Project Teams Gathering closes all menus and restores Events focus; Enter on Use Cases navigates to its landing. Hosted Nova search now displays10 migration labels for10 video results. Mobile viewport overrides reset after testing. No CMS or service writes.

## Compact-header hosted acceptance and editor smoke check

89b141a Publish34927793317 and Validate34927793249 completed successfully. Local header boundary checks at320/600/601/1000/1001px showed no horizontal overflow and expected search/menu visibility. Fresh hosted Learn375px confirms logo/Menu on the same row, hidden desktop search and visible Search link after opening the menu. Viewport reset. This closes the prior hosted mobile-header gate.

Hosted Tina `/admin/` loaded the homepage form and its preview, Save/Reset disabled, and exposed the expected13 Collections entries plus Global site announcement. Media Manager loaded existing image/PDF entries; searching Rocky-Release-Preview narrowed to the matching PDF after debounce. Opening its details displayed the Astro-hosted asset URL. No upload, delete, content edit or save was attempted. This is editor/listing/search availability, not completion of pending upload/concurrency acceptance.


## September 15 — dedicated Playwright and PDF upload

User explicitly selected standalone Playwright and authenticated its separate persistent browser profile in Cloudflare Access and Tina. Tooling/profile are private and outside the application repository. Homepage editor and Media Manager loaded. Uploading the public `OS14ATLLunchWednesday.pdf` through the existing file input succeeded; the new library item resolves to `/cms-media/4feb4ca44e562b23ade6f4ae7603ac5cb7728886b482589cae9cd5655e1159ab.pdf`. Hosted readback returned200, application/pdf, inline disposition,71,607 bytes and matching SHA256. A browser screenshot showed the correct Atlanta lunch menu in Chrome's inline PDF viewer. No content field was edited/saved; the test media object is retained.

Correction to the initial Upload-button diagnosis: waiting for Playwright's `filechooser` event timed out, but that does not prove the button is broken. Installed Tina3.13.0 uses react-dropzone with `useFsAccessApi` defaulting true. A temporary browser probe confirmed the button invokes `showOpenFilePicker` and awaits its native picker. This path does not emit the expected event, as documented in [Playwright issue8850](https://github.com/microsoft/playwright/issues/8850). Reloading removed the temporary probe; no application patch was made. Automated file-input upload/storage/rendering passed; completing the native operating-system picker remains distinct from those checks. Do not ask users to change extension file permissions based on this timeout.

## September 15 — Use Cases browser interactions

Dedicated Playwright compared hosted `/use-cases/` with production. Main heading, introductory paragraphs and video promotion copy match. Production initially showed its shell without stories, then populated its client-rendered gallery; this was delayed rendering, not a confirmed missing gallery. Settled production text included FPT SmartCloud, Telekom Networks Malawi and United Nations with summaries matching Astro. A subsequent production card-locator inspection timed out and reset the automation runtime; no complete card-by-card parity claim is made.

Hosted Astro interactions passed: submitting CERN search returns one CERN story; Clear restores74; Alphabetical settles with ATT, AdForm, Adobe Advertising Cloud, American Airlines and BBVA first; Location settles with Africa, Asia, Australia, Europe, North America and Oceania groups; an unmatched search displays0 and the explicit empty-state message; Clear restores74 again. List view activates its list layout. At375px, document scrollWidth360 fits the viewport, and screenshot inspection shows wrapped filter controls, search, readable story summaries and details. The filtered CERN view had no broken loaded images. This does not certify every lazy-loaded image, all tags, Industry/Large-scale behavior or video playback. Viewport was restored to1440 before the later runtime timeout. No site content, service records or consent settings were changed.

## September 15 — complete story-catalogue comparison

After confirming the prior browser process had ended, reopened the dedicated persistent Playwright profile; Cloudflare authentication survived. Both Use Cases pages report the same browser title. Production's74 rendered story cards and Astro's74 match in recent ordering, names, all summaries, full descriptions, ordered tags and normalized destination URLs. Text comparison collapses whitespace only; internal Astro links resolve against the production origin for comparison. Large Scale shows the same6 stories in the same order. Industry shows the same10 groups with identical ordered story names in every group. Machine-readable outcome: [Use Cases browser audit](use-cases-browser-audit.json).

This closes the prior full-catalogue copy comparison, not image/interaction pixel parity or destination application readiness. Video and schedule destinations remain explicitly deferred; unchanged external links were not opened. No content or production data mutations. Runtime now uses `reviewContext`, `reviewProd`, `reviewAstro`; default action timeout10seconds prevents an individual locator from exhausting the automation runtime.

## September 15 — AI and VMware lower-page checks

Hosted AI and production share the same main heading. All9 contributor logo names match and all9 Astro images loaded; these remain externally served company assets, not evidence of R2 migration or company-service production readiness. Pausing the Astro quote rotation exposes Start rotation; Next reaches2of2 and keyboard Enter on Previous returns1of2. At375px document scrollWidth360 fits. Screenshot confirms readable quote/controls and contributor heading. This does not prove timed autoplay or reduced-motion behavior.

VMware production lower-page text includes the comparison table, contributor section,9 migration tools and80%/60% metrics. Astro renders the same9 tool titles. Compared all9 rendered table cells between production and Astro: normalized whitespace and decorative arrow differences only, all match. Mobile375px table width312px, document scrollWidth360; screenshot confirms readable two-column cells and no horizontal page overflow. All37 Astro main images reported no completed/broken images at initial desktop inspection, and lower-page mobile inspection likewise found no completed/broken images. Lazy images not yet requested are not certified by that check. External tool destinations and newsletter submission were not exercised. Restored viewport1440. No content or service writes.

## September 15 — mobile homepage editor

At390px Tina loaded the homepage with document width390 (no horizontal overflow). Opened Hero and changed the headline without saving; the preview iframe H1 updated to the test value. Reset displayed confirmation; confirming restored the original headline and disabled Save. No Git write or content publication. Viewport restored1440. The visible Headline label was not resolved by getByLabel; editing used the observed input name hero.title. Label association needs a separate accessibility review; this is not a complete mobile CMS acceptance pass.
# September 15 — Tina field label repair

Tina 3.13.0 rendered text/textarea labels with `for` values but omitted matching input IDs. The pinned compatibility patch now supplies the existing input name as its ID in both renderers. Two regression tests failed before the patch and passed after; the full 98-test suite, Astro check (zero errors/warnings, one hint) and full Tina/Astro build passed.

Browser verification used the normal built Worker on localhost:4542, serving only its `/admin/**` assets through a Playwright route override on the authenticated Astro review origin. Hosted content/API requests remained real. This is predeployment build evidence, not hosted deployment acceptance. Headline and Introduction resolve by accessible label, clicking Headline focuses the input, and Save remains disabled. Fresh 390px mobile load has document width 390 and both labels work. Resizing an already-open desktop editor to mobile temporarily produced 714px overflow; reload cleared it. That separate Tina responsive-state limitation remains open. No content was saved.
