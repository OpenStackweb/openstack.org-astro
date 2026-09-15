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
