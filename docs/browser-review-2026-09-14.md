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

Resize clarification: subsequent hosted inspection without reloading showed the 714px overflow settles to document width 390 as the existing sidebar transition finishes. A desktop→390px retry with a bounded wait also settled without reload, with Headline visible. The intermediate screenshot does not establish a persistent responsive defect; no resize patch is warranted on that evidence.

Deployment acceptance: runtime commit `a39516d`, Publish `34973247642` and Validate `34973247613` both succeeded. A fresh authenticated page with no request overrides loaded the hosted homepage editor: Headline input has `id=hero.title` and label Headline; Introduction textarea has `id=hero.text` and label Introduction. Both resolve through `getByLabel`; original headline and disabled Save were verified. No content writes occurred.

Tina 3.13.0 rendered text/textarea labels with `for` values but omitted matching input IDs. The pinned compatibility patch now supplies the existing input name as its ID in both renderers. Two regression tests failed before the patch and passed after; the full 98-test suite, Astro check (zero errors/warnings, one hint) and full Tina/Astro build passed.

Browser verification used the normal built Worker on localhost:4542, serving only its `/admin/**` assets through a Playwright route override on the authenticated Astro review origin. Hosted content/API requests remained real. This is predeployment build evidence, not hosted deployment acceptance. Headline and Introduction resolve by accessible label, clicking Headline focuses the input, and Save remains disabled. Fresh 390px mobile load has document width 390 and both labels work. Resizing an already-open desktop editor to mobile temporarily produced 714px overflow; reload cleared it. That separate Tina responsive-state limitation remains open. No content was saved.
# September 15 — AI quotation editor acceptance

Hosted Tina, normal authenticated browser without overrides: Enter opens a quotation; its textarea and Attribution input resolve by their labels. An unsaved attribution appeared in the live preview and survived returning to the list and reopening the fields once React settled. Reset restored the original. Keyboard Space pickup, ArrowUp and Space drop moved the second quotation above the first; the live region reported the intended target and Save enabled. Reset restored the original order. Keyboard events must wait for pickup/target state rather than being sent before rendering settles.

Added a third quotation, entered text/attribution, returned to the list and verified it remained. Removed that exact third item; original two entries remained. Final confirmed Reset discarded all test changes. No Save, Git write or service mutation occurred. At 390px the settled document width was 390; nested quotation fields and footer controls were visually inspected, then viewport restored to 1440. This verifies this collection's unsaved add/edit/remove/reorder/reset and mobile layout, not a hosted save roundtrip or pointer/touch dragging.
# September 15 — navigation destination feedback

Hosted acceptance: regenerated Tina lock in `9d7a870` (only the three stored Destination UI configurations changed). Normal full build passed; Publish34975421971 succeeded. Fresh unmodified hosted browser verified invalid ftp destination shows the inline error and disables Save; restoring the original clears the error, then confirmed Reset leaves Save disabled. No content was saved. The earlier two deployments stopped safely on the stale schema lock; reindexing alone could not fix that, as documented in deployment.md.

Navigation's existing before-submit URL guard rejected unsupported protocols but did not give useful persistent field feedback in the hosted editor. Added a shared destination validator to each navigation Destination field and retained the same guard at submission. Paths, http/https, mailto and menu-only # remain allowed; empty dividers remain valid. Invalid protocols, embedded credentials and malformed URLs receive an actionable inline error.

Full99 tests and Astro check (252 files, zero errors/warnings, one hint) pass. Normal TinaCloud build initially stopped because the added field configuration was not indexed remotely. Local hosted-format Tina compilation with cloud checks skipped and the full Astro build passed; this does not bypass the normal publishing gate. A fresh normal Worker4543 plus page-scoped admin asset override verified ftp://example.com shows the inline error and disables Save. Restoring /use-cases/ clears the error and enables Save again. Closing the unsaved test tab discarded the test state. No content was saved; the overridden tab was closed. Hosted deployment acceptance remains pending.
# September 15 — named CMS display toggles

Hosted acceptance: runtime3051b8f, Publish34976607488 and Validate34976607496 succeeded. Fresh unmodified browser resolves checkbox Display, reports no duplicate switch, and Space hides the newsletter in the real preview iframe. Confirmed Reset restores the checkbox/newsletter and disables Save. No content saved. Owned local Worker4544 was stopped after predeployment testing.

Tina's Toggle used an absent top-level `name` for its ID, leaving Display labels disconnected from checkbox fields. Extended the existing pinned field-label patch to default to `input.name`. The purely decorative label is hidden from accessibility APIs instead of exposing a second unnamed switch. The native checkbox retains its state and keyboard behavior.

The installed-component regression failed before the patch and passed afterward. All100 tests, Astro check (zero errors/warnings, one hint) and normal full build passed. A page-scoped built-admin override from fresh Worker4544 resolved the footer checkbox as `Display`, found no duplicate switch role, and verified Space hides/restores the newsletter in the real hosted draft iframe. Clicking the visible Display label toggles it too. Confirmed Reset restores checked state and disables Save; no content saved. Override tab closed. Hosted deployment acceptance pending.
# September 15 — nested footer link acceptance

Hosted normal editor, Documentation column: Enter opened the column and nested link. An unsaved link-text edit appeared in the real footer iframe and survived returning to the link list and reopening. Reset restored the original. Added a fifth link, filled its required text/destination, verified its list/preview presence, removed the exact fifth entry and verified disappearance. Final Reset discarded all test state.

Keyboard Space/ArrowUp/Space moved Getting Started ahead of OpenStack Manuals; both editor order and iframe footer link order matched. Events were paced to the drag sensor's pickup/target state; the initial rapid sequence did not move the item. Reset restored the original order. At390px, the settled editor document width was390; nested text/destination fields and controls were visually inspected. Original OpenStack Manuals text and stored http://docs.openstack.org/ destination remained; viewport restored1440, Save/Reset disabled. No Save, Git content write or external navigation occurred. This covers unsaved editing/reordering/mobile for this nested list, not hosted publishing or pointer/touch dragging.

## September 15 — early conference landing routes

Connected six existing ConferencePage records to the Astro catch-all: San Francisco 2012, San Diego 2012, Portland 2013, Hong Kong 2013, Atlanta 2014 and Paris 2014 (legacy route keys in `conference-keys.json`). These had rendered notices despite having imported landing data and a preparation helper. The page now presents the historical overview, news updates, reminder, resource navigation and separate details sidebar.

Source review: SilverStripe2172298743fe807a92758cf307059b69a7dba668, ConferencePage controller/template. The controller selects five child news records; its RSS method uses Children. The migrated RSS helper serves the imported landing updates, so full legacy feed coverage is not certified. A public Atlanta RSS request returned403 during review; it provided no comparable feed evidence.

Built Worker at localhost4547: all six pages200, one H1, no application notice; all six RSS endpoints200 with4/3/5/3/3/1 items respectively. Atlanta inspected in Playwright at1440 and390: three-column desktop and one-column mobile, no horizontal overflow. Local R2 images are unavailable, so hosted media verification remains required. Normal TinaCloud/Astro build and100 tests passed. Full515-route inventory:130 redirects,246 rendered-unverified,139 notices, zero errors. HTTP coverage is not full parity.

Editorial limitation: the inherited Atlanta header says May5–8,2013 while the body says May12–16,2014. Public production shows the inconsistency too. Retained pending source-backed correction; not counted as verified historical copy. Landing overview/sidebar/news records remain Git-editable in archive-event-landings.json; shared event fields use the existing Tina event collection. No new Tina landing editor has been claimed.

## September 15 — conference presentation recovery

Fresh production/hosted browser comparison: all six imported conference news heading sequences match public production (whitespace normalized; Astro adds an accessible page title). All six pages' content img elements loaded on hosted8b90314. The Paris screenshot exposed a separate omitted CSS-background header, so earlier img-only checks were insufficient to certify visual parity.

Read live conference.css: banners and date graphics are CSS backgrounds; title/date text is hidden by production CSS. Recovered all twelve referenced files from public Swift, visually reviewed the contact sheet, uploaded only these files to the existing R2 bucket and read back each size/SHA256 successfully. Sources/dimensions/hashes: conference-presentation-assets.json. No Pro icon dependency was imported.

New ConferenceHeader uses responsive original artwork and sanitized CMS introduction markup with its date/summary layout. Calendar fallback description is Git data. Six conference routes share this presentation; other archived child page wrappers remain a separate comparison task. Landing body and shared Tina introduction ownership are preserved. Source Atlanta calendar explicitly shows May12–16,2014, confirming the correction of the inherited May5–8,2013 introduction text. This supersedes the earlier unresolved date flag.

Local built Worker4548: Paris1440/390 screenshots reviewed; no horizontal overflow, one H1. Only the twelve banner/calendar requests were fulfilled from checksum-reviewed local files for this predeployment test; this is not hosted media acceptance. Normal cloud build,100tests and check255files0errors0warnings1hint passed before moving the unchanged SF alt description from component to Git metadata. Final build/deployment/hosted verification pending.

Final normal cloud build passed. A sweep against the older running Worker overlapped regeneration of dist and produced inconsistent overflow observations; a fresh Worker4549 against the completed final build was used for authoritative layout checks: all six at390 have scrollWidth375, oneH1 and327px content grid. No additional CSS fix was needed. The page-only image override was closed after its visual check. Hosted verification follows publication.

## September 15 — shared conference child headers and social cards

Source2172298743fe807a92758cf307059b69a7dba668 remains clean. ConferenceSubPage.ss and ConferenceNewsPage.ss both render Parent.HeaderArea before their page content. Fresh production Paris FAQ has that shared header; Astro1be1337 did not. Moved the six-event presentation mapping into withArchiveEvent so43 imported child pages inherit the same banner/calendar while retaining their own content/title. Counts: SF9, SD6, Portland6, Hong Kong10, Atlanta5, Paris7. Vancouver is not included in this six-event artwork mapping.

Child pages and six landings now use the event banner as their OG/Twitter image with the event title as image description. Other archives keep their existing default image/description behavior. Expanded SEO audit enumeration to include all six landing URLs:1237 targets, zero inspection failures/issues. This checks local built metadata, not crawler access through protected Access or social-platform rendering.

Local final Worker4550: all43 child routes200, shared banner present, oneH1 and expected absolute event image URL. Shared-event draft regression test and full100tests pass; check255files0errors0warnings1hint; normal TinaCloud/Astrobuild passed. ParisFAQ1440/390 screenshots inspected, mobile390scroll375. Only local /assets and /themes requests were fulfilled from the authenticated hosted media endpoints for this predeployment visual check; page closed afterwards. SourceContent ownership preserved: no shared introduction or child body edits in this change. Hosted acceptance pending release.

## September 15 — remaining RedirectorPage coverage

Fresh public first-hop HEAD inspection of48 routes that the local inventory still classified as notices found46 redirects and2 HTTP200 exceptions (/fits/ and /ptg/rooms/help/). Evidence in remaining-redirector-review.json redacts meeting access parameters; exact meeting URLs remain private, outside Git.

Restored29 non-meeting redirects using production301 destinations, localizing www.openstack.org/openstack.org destinations to the same preview origin. Static chain traversal found no cycles. Three targets missing locally were checked publicly: Tokyo2015call-for-speakers, Berlin2018vote-for-speakers and survey2018 each redirects anonymous visitors to SilverStripe sign-in. Added explicit historical-workflow notices there; no proposals/votes/survey submission is enabled.

Two broken external destinations remain notices with specific explanations: store's Shopify destination404; Austin2016party destination noDNS resolution. Materials DropboxHEAD returned200 (folder contents not certified); summit sponsor target returned403 (availability unverified). These first-hop redirects preserve production behavior without claiming target functionality. Fifteen meeting-room destinations require configuration/ownership review and remain notices.

Normalbuild,100tests andcheck255files0errors0warnings1hint pass. Final builtWorker4551 verifies29rules with/withouttrailing slash (58status/exactLocation/proxy-disabled assertions), plus five explicitnotice200responses. Full route audit follows; source edits preserve service ownership and do not touch production.

Redirect runtime69db965 hosted acceptance: Publish34981641544/Validate34981641531SUCCESS. Queens, jobmarket and Vancouver2015CFP no-follow requests return expected301/localLocation. Store notice visually reviewed. Its missing external destination exposed an existing unconditional empty anchor in ApplicationNotice; guarded the link on both destination and label. Normal build passes; freshWorker4552/store/DOM contains only labeled community/demo links. No production or service writes.

September15 notice cleanup18de54d: Publish34982237147/Validate34982237134SUCCESS. Normal hosted/store/now contains only community/demo links, with no empty external arrow anchor. No production or CMS writes.

## September 15 — empty legacy redirect destinations

Fresh Playwright production visits confirm /fits/ and /ptg/rooms/help/ return pages containing SilverStripe's no-destination redirector message, not hidden content or working applications. Astro now states that the original destination is unconfigured. Normal TinaCloud/Astro build passed; freshWorker4553 both routes200 with the exact finding and oneH1, PTGhelp mobile390scroll375 screenshot reviewed. No empty external link is rendered. A staff destination/retirement decision remains; no replacement target was invented.

Offline sitemap planning now recognizes the six restored conference landings:249 canonical content candidates and986 held URLs from1237 audited URLs. No public sitemap or indexing switch was enabled. Imported child pages were already covered by editorial-paths. This is planning evidence, not launch approval or social-crawler access certification.


## Containers testimonial and feature icons — September 15

Production/hosted Astro desktop comparison found the Containers FICO testimonial
flattened into a generic row: attribution lines collapsed, portrait framing lost,
and quotation typography/background missing. The next section also lost three
feature icons and had a gray background instead of white.

Source: SilverStripe2172298743fe807a92758cf307059b69a7dba668,
`ContainersPage.ss`, `containers.scss:151` and `enterprise.scss:1216`.
Converted the testimonial to the existing editable quote section with FICO logo,
portrait, quote body and two-line attribution. A normalized-text comparison
confirms the original quote/attribution and exact two asset paths are preserved.
Restored scoped quote styling and section background; added local SVG gears and
server symbols alongside the existing sliders icon. Tina block-icon choices and
server preparation now agree, so these choices remain editable. No Font Awesome
assets or subscription dependency were added.

All112 existing tests pass, including editorial schema coverage. Astro check has
zero errors/warnings and two existing hints. The initial hosted Tina build stopped
at the expected local/remote schema mismatch because the new enum choices were
not yet pushed. Standalone build and post-push hosted acceptance follow separately.
Hero spacing/action styling and lower-page parity are not covered by this change.

Follow-up: the enum change required regenerating the committed Tina lock with
`tinacms dev --no-server --noWatch`; `tinacms build` did not update it. Commit
9537ad3 passed the normal hosted build and deployed. Hosted inspection caught two
remaining CSS selectors targeting a nonexistent .container rather than
.content-width. Corrected those selectors; a fresh built Worker on4562 confirms
Georgia/pre-line attribution, all three SVG icons and the intended text measure.
Desktop and390px mobile screenshots inspected; no horizontal overflow. Local
image requests used page-only fulfillment from authenticated hosted R2 assets.
The next protected deployment needs normal hosted acceptance of this correction.

## Telecom hero, research band and feature grid — September 15

Production Playwright comparison at1440px found the headline rendered40px/light
in Astro rather than28px/600, its subtitle18px rather than28px, extra research-band
spacing, and five feature illustrations missing from a collapsed five-column row.
Source2172298743fe807a92758cf307059b69a7dba668: TelecomHomePage.ss and telecom.scss.
Scoped Telecom typography/spacing now follows the source; restored the original
three-plus-two feature arrangement with local SVG symbols. These are deliberately
project-owned line icons, not a Font Awesome Pro dependency. Tina block choices,
server preparation and committed Tina lock include the restored icon options.
A semantic comparison proves copy, destinations, order and other content fields
unchanged after ignoring icon choices and empty legacy i tags.

All112 tests pass; Astro check reports zero errors/warnings and two existing hints.
Standalone Astro build passes. Local4563 desktop screenshot reviewed for hero and
feature grid; image requests used page-only fulfillment from hosted R2. Final
mobile, normal hosted Tina build and deployment acceptance follow. This pass does
not certify the later report/video/promotion/newsletter sections or the historical
webinar destination; these retain separate editorial/application decisions.

## Telecom report dialog and lower-page presentation — September 15

At SilverStripe2172298, TelecomHomePage.ss wires its report CTA to #downloadModal,
which contains a public PDF and Mailchimp signup. Astro had imported href="#"
without the modal behavior and displayed its contents at the bottom of the page.
Production click did not visibly open the modal during this browser observation;
source and hidden DOM establish the intended workflow independently of that bug.

IndustryDownload now uses a native dialog, with a real PDF href as the no-JavaScript
fallback. It reuses existing Git/Tina section body, title and action fields; the
newsletter retains the exact existing Mailchimp action and bot-trap field. No new
subscription service or business-data write is introduced. Delegated activation
supports replacement of the markup during Tina preview updates. The report panel
background/button, AT&T quote treatment and five video play overlays also restore
source-backed presentation. Video destinations remain deferred application pages.

Local4564 keyboard Enter opened the dialog, Escape closed it and restored focus;
Close button worked. Empty email fails native validation, synthetic
review@example.invalid passes, and FormData contains EMAIL and the original
honeypot. No submission was made. Browser review caught whitespace in the old
modal body becoming an indented Markdown code block after removing empty icons;
the body was dedented before the final build. Final desktop/mobile and deployed
acceptance remain separate. The existing hosted NFV PDF returns200application/pdf,
inline,2171507bytes; original report is dated2016.

Editorial discrepancy: the visible source intro says six communications companies,
while the old dialog says ten. The PDF lists ten general contributors and seven
NFV user contributors (including two NTT affiliations). This likely explains the
mismatch but does not conclusively define the intended company count. Existing
wording remains; staff can confirm or remove the numerical qualifier. PDF bytes
are unchanged. Real subscription acceptance and downstream video playback are not
certified by these UI checks.

### Telecom report acceptance and final promotion (September 15)

Deployed ca536ff report dialog verified in the normal authenticated browser: desktop Enter opens/focuses Close, Escape returns focus to Download Now; desktop 598px and mobile 337px dialog widths equal scroll widths. Mobile has no accidental Markdown code blocks. All five video thumbnails and five overlay images decode; desktop screenshot reviewed. No newsletter subscription submitted.

Production final promotion and SilverStripe TelecomHomePage.ss/telecom.scss at 2172298 use SummitBanner-1140x500.png, centered ~653px copy, 24px heading, 14px text, and a red video action. Restore those using existing section backgroundImage and block action fields. Public production banner (30,265 bytes) visually reviewed and uploaded to R2 with checksum readback; manifest telecom-promotion-assets.json records provenance. Copy and video-search destination remain unchanged; Videos remains a deferred application. Final promotion build/browser/deployment verification pending; the earlier report checks do not establish this change's acceptance.

Promotion validation: Astro check 268 files, zero errors/warnings (two existing hints); eight relevant industry/accessibility tests passed. Normal Tina/Astro build passed. Local built Worker 4566 desktop/mobile screenshots reviewed with only the new banner fulfilled from its checksum-verified local copy. Initial review caught excessive heading weight and full-width CTA; corrected to production computed weight 400, 653px copy and fit-content button. Final CSS build and hosted review tracked in vault handoff. No CMS schema change; background/action fields already exposed by tina/schema/industry.ts.

ce881e0 hosted promotion acceptance: Publish35009817315 and Validate35009817239 succeeded. Normal hosted desktop/mobile screenshots reviewed; 400-weight heading and compact CTA verified, mobile width375 equals scroll375. Banner HTTP200 image/png 30,265 bytes. No response overrides used on hosted site.

The adjacent missing 200px decorative network divider is sourced from the production `www-images-prod/nfv/fixed-bkgd.jpg` bucket (distinct from the assets bucket). Source and production computed background match. Image visually reviewed; R2 checksum readback verified for 129,770 bytes. Added through the existing editable section background field with no schema change. Fixed attachment matches desktop production; mobile and reduced-motion use scrolling attachment. Local built4568 desktop/mobile screenshots reviewed; height200, mobile375==scroll375 and reduced-motion attachment verified. Normal Tina/Astro build passed, check268 zeroerrors/warnings(two existing hints), eight relevant tests passed. Hosted divider acceptance pending deployment.

### Telecom report heading order

SilverStripe TelecomHomePage.ss at2172298 and production place the Foundation Report label above the heading. Added optional industry section eyebrow text through Tina schema/lock, server preparation and Astro HTML; moved the existing label out of the block body without changing its wording or report links. Blank/absent values remain supported. Local built4570 desktop/mobile screenshots reviewed; text precedes h2 in DOM, divider lines shrink at phone widths, mobile375==scroll375. All114tests and check268zeroerrors/warnings(two existing hints) pass; standalone Astro build passes. Normal Tina build correctly rejects the unpublished optional-field schema difference; push and hosted indexing/build/editor verification remain required. No direct deployment of the local editor output.

Report label a2db126 hosted acceptance: Publish35013037714/Validate35013037686 passed. Normal hosted DOM puts label paragraph before H2. Tina field edits update preview; clearing removes only the label, retaining heading; confirmed Reset restores original label and disables Save. No test content saved.

Enterprise feature comparison: EnterpriseHomePage.ss2172298 closes three h3 elements with h4 tags. Imported normalization consequently wrapped each paragraph inside h3; Astro rendered descriptions as large bold headings. Corrected each heading boundary, preserving all text (normalized comparison), and restored three project-owned check SVGs through existing icon fields. Scoped layout matches enterprise.scss heading/card typography and blue circular checks. No Font Awesome dependency. The first hero screenshot preceded image decoding; subsequent decoded screenshot confirms the existing R2 hero is present, so no hero asset change was made. Local4571 desktop/mobile card screenshots reviewed:3headings/3icons/0paragraphs inside headings/mobile375==scroll375. Normal Tina/Astro build, check268zeroerrors/warnings(two hints), eight relevant tests pass. Full Enterprise page/hero spacing/booklet modal/lower sections and hosted feature acceptance remain open.

Enterprise b75c743 Publish35013562450/Validate35013562430 succeeded; hosted3featureheadings/3icons/zeroh3paragraphnesting verified. Booklet source/production review confirms three editorial resource modals, not API workflows: online/print/paperback links match imported content. New IndustryResourceDialog progressively moves only those three existing sections into native dialogs; without JS they remain visible anchor destinations. Native close/Escape/focus return, fragment-target opening and Tina replacement lifecycle use a scoped custom element. No video application implementation introduced.

Local4573 final mobile dialog337client==scroll/536height screenshot reviewed; previous4572desktopkeyboardopen/Escape/focusreturn passed. Initial browser spacing exposed stronger scoped section CSS; final open-dialog selectors remove inherited section/row padding. All three launchers open correct sections (3/2/2links) and Close works. Separate JavaScript-disabled browser proves hero booklet section visible with all3choices; browser closed afterward. Check269zeroerrors/warnings(two hints), normal Tina/Astro build and final standalone CSS build pass. No content/asset changes, no Amazon purchase or newsletter submission. Hosted dialogs/PDF delivery and CMS rerender acceptance remain pending.


### Enterprise booklet acceptance and security promotion — September 15

Hosted eb76080 booklet checks passed: all three launchers, native close/Escape/focus return, mobile337px dialog without horizontal overflow, and five PDF range responses with inline application/pdf and PDF signatures. Tina unsaved heading edit and Reset both preserved dialog operation; no test content published.

The Enterprise security promotion was still a generic white section. SilverStripe EnterpriseHomePage.ss and enterprise.scss at2172298743fe807a92758cf307059b69a7dba668, plus production DOM/computed styles, establish a gold band,190px badge,30px heading and14px copy with a blue link. Restored these styles in the existing structured IndustryLanding renderer without changing CMS fields, text, links or assets. Desktop badge/copy columns stack on mobile. Local4574 desktop and390px mobile checked; mobile screenshot reviewed and375px document has no horizontal overflow. The local R2 binding lacks the badge, so that one image request used bytes fetched from the authenticated hosted asset (HTTP200image/png); this is explicitly local layout evidence, not hosted acceptance. Normal Tina/Astro build and Astro check269files zero errors/warnings(two existing hints) passed, followed by standalone rebuilds for final CSS corrections. Hosted acceptance pending deployment.


Security promotion10506b8 hosted acceptance: Publish35015395060 and Validate35015395059 SUCCESS. Normal authenticated desktop/mobile screenshots reviewed without response overrides: gold band, left-aligned desktop copy, native badge decoded(naturalWidth211), local /software/security/ link,375px mobile with no horizontal overflow.

Enterprise hero comparison: original template and current production show489px desktop/581px mobile hero,750px desktop title,42px300 heading,110px top content inset, right-aligned background and325px booklet control. Scoped Enterprise styles restore these dimensions while retaining existing CMS fields and native booklet dialog. Normal build and check269files0errors/warnings(two hints) pass. Local4574 final desktop/mobile screenshots reviewed:489/581 heights,750 desktop title,375 mobile scroll375; booklet action still opens and Escape closes. Local hero image uses authenticated hosted200 bytes because local R2 is empty; hosted visual acceptance remains pending.


Hero2dba0f0 hosted: Publish35015855973/Validate35015855993 SUCCESS. Normal hosted hero image decodes2625px; mobile581px/desktop489px heights and750px desktop title verified. Desktop screenshot reviewed; booklet opens and Escape closes.

Enterprise recommendations: original EnterpriseHomePage.ss/enterprise.scss2172298 and production show two editorial guidebook cards over UseCase-Recomendations.jpg. Imported only this33424-byte JPEG into R2; SHA2563dcfcc419b11762d8d4c1343648489bd1aa6ace54a754a85a7fb06fcacc6f753 readback verified. Source URL/checksum and guarded uploader recorded in enterprise-promotion-assets.json and upload-enterprise-promotion.mjs. Existing section backgroundImage field preserves Tina editing; existing text/links unchanged. Restored dark cards, heading, divider, responsive buttons and centered copy with scoped CSS. Normal build/check269files0errorswarnings2hints pass. Local4574 desktop/mobile screenshots reviewed with local image response from verified source bytes; no horizontal overflow(390==390), both download buttons open intended native dialogs and Escape closes. No Amazon action. Hosted recommendations and Tina background field acceptance remain pending.


Enterprise case-study cards and Forrester callout: source EnterpriseHomePage.ss/enterprise.scss2172298 and production computed styles establish pale-blue card band, left-aligned24px headings/14px copy/blue actions, followed by a cyan3/5/4-column report callout. Scoped styles restore this without changing content/links/schema. Normal build/check269zeroerrorswarnings2hints pass; final standalone rebuild removes an extra divider caused by rendered anchor paragraph. Local4574 desktop cards and desktop/mobile callout screenshots reviewed;375mobile==scroll375. Three card images use authenticated hosted bytes for local R2-only layout review. Hosted acceptance pending. Fixed Enterprise videos are hardcoded YouTube embeds in the template, separate from the searchable video catalogue; no video behavior changed here.


Enterprise More Use Cases/testimonial: source EnterpriseHomePage.ss2172298 contains four image/text story rows; import had flattened all into one block. Split into four existing Tina rows with paired image/body blocks, asserting exact markup equality after whitespace normalization. Text, URLs and images preserved. Added paragraph/linebreak markup to the existing testimonial attribution and scoped styles for150px round story images,24px headings,14px body, portrait/Georgia quote/PayPal attribution. Normal build/check269zeroerrorswarnings2hints pass. Local4574 desktop story/testimonial and mobile story screenshots reviewed, four rows and375scroll375. Six images supplied from authenticated hosted bytes for local empty R2; hosted and CMS reorder/edit acceptance pending. Previous eab62ca CI35017242283/35017242392SUCCESS; normal hosted backgrounds and three decoded419px card images verified, full hosted visual screenshot attempt timed out and remains open.


Enterprise server divider: source EnterpriseHomePage.ss/enterprise.scss2172298 and production .fixed-image.server establish the missing200px photographic band between stories and testimonial. Added existing editable backgroundImage section, sharing Telecom divider CSS including mobile/reduced-motion scrolling. Migrated only server-fixed-bkgd.jpg78893bytes, SHA25698188891ff8ce4278e72402d3ccadcadcc39c517903400b7efc8571e1341ee1c; guarded upload and full readback verified. Existing recommendations image reused unchanged. Normal build/check269zeroerrorswarnings2hints pass. Local4574 unobstructed desktop screenshot reviewed (initial screenshot had previous hash-opened booklet, dismissed before acceptance);height200/fixed, reduced-motion scroll, mobile200/scroll and375scroll375. Local image supplied from verified source bytes; hosted asset/rendering acceptance pending.


Enterprise fixed video embeds: source2172298 hardcodes four YouTube IDs; three visible cards targeted Bootstrap modals, but imported cards had href# and duplicate play images. Restored three target anchors and removed duplicate play images; CSS draws decorative play indicators without Font Awesome. Extended existing progressive resource dialog for video labels, descriptive iframe titles, lazy activation by setting source only on open, and clearing sources on close to stop playback. Existing sanitizer uses youtube-nocookie hosts, preserving original IDs. No catalogue/API service replacement. Normal build/check270zeroerrorswarnings2hints pass; final standalone title correction builds. Local mobile337px dialog==scroll337, all three IDs verified, initial iframe[src] count0 and after async close0. Disney iframe loaded title Atlanta2014Keynotes:Day1OpenStackKeynote-Disney; playback itself not certified. Mobile modal screenshot reviewed before iframe load; full card imagery/hosted playback/CMS mutation acceptance remain pending. No content-description changes, backend calls or new asset uploads. Divider2e45b4dCI35018679155/35018679148SUCCESS;hosted200image78893bytes/200pxheight/backgroundURL verified, visualhosteddividerpassnotyetrecorded.

## September 15: shared footer comparison

Full Enterprise desktop comparison exposed shared footer differences: CMS Font Awesome icon names were ignored, social links became vertical text, and credits occupied a separate full-width row. Source `openstack-org` at `2172298743fe807a92758cf307059b69a7dba668`, `themes/openstack/templates/Layout/Includes/Navigation_Footer.ss`, uses four narrow link columns and a double-width social/credits column.

Restored that arrangement in the shared Astro footer, keeping all existing CMS content, visibility controls, destinations, rel attributes, uploaded-icon overrides and WeChat QR dialog. Four locally served brand SVGs map existing CMS icon names; unknown names retain visible text. Files come from Font Awesome Free 5.15.4 (https://github.com/FortAwesome/Font-Awesome/tree/5.15.4/svgs/brands), CC BY 4.0; bundled license and attribution retained, path fill adapted for the dark footer. No Pro kit, subscription or external font dependency.

Normal Tina/Astro build passed; Astro check: 270 files, zero errors/warnings, two existing hints. Local Worker4575: all seven icons decoded; desktop and 375px footer screenshots reviewed, no horizontal overflow; keyboard Enter opens WeChat dialog, Escape closes it and restores button focus. Hosted acceptance and unsaved Tina preview acceptance follow deployment. Production and newsletter submissions untouched. Generic Enterprise comparison still has scoped differences (preview notices/auth state, editorial video descriptions, decorative icons, newsletter handoff); not a claim of pixel-perfect or application parity.

Hosted footer acceptance (`9ec0f47`): Publish35021272131 and Validate35021272099 succeeded. Authenticated Astro desktop and 375px footer screenshots reviewed; seven icon images decoded, no horizontal overflow. Enter on WeChat opens the native dialog; Escape closes it and restores focus. Tina global-footer preview: temporary social heading appeared with all seven icons, then explicit Reset restored heading/disabled Save. Hiding Social links removed the social block while preserving Credits; explicit Reset restored the clean form. No CMS save or business submission was made. These checks establish this footer change, not full-site/CMS workflow completion.

## September 15: Science resource dialog and layout

Compared complete authenticated Astro and public production `/use-cases/science/` desktop renders. SilverStripe `SciencePage.ss` at2172298 defines `downloadModal`, opened by both the hero and lower book buttons; its fields remain in Astro's existing scienceBook CMS object. Enabled the existing progressive IndustryResourceDialog around ScienceBook: JavaScript creates a native dialog, while no-JavaScript content remains an accessible inline section. Preserved title, description, both PDF references and all three external resources.

Corrected Science-only community prose alignment and unintended gray/padded story-card wrapper; adjusted body/card typography and icon color without changing content or other industry pages. Normal build63848/check25669 succeeded (270files, zero errors/warnings, two existing hints). Local4576 both launchers open one dialog containing five links; Escape restores hero-button focus; Close works. Desktop and375px dialog screenshots reviewed (324px dialog, no horizontal overflow); community screenshot and transparent story wrapper verified. Hosted deployment/CMS acceptance pending.

Both hosted Science PDFs returned206, application/pdf and `%PDF-1.4` signatures via bounded range requests. Their current Content-Disposition is attachment, not inline; review this against the read-book label separately. No purchase/subscription action performed. Existing CERN catalogue link remains subject to deferred Videos handling; this does not implement a video catalogue. Remaining page differences include topic-grid treatment, media overlays, hero spacing and full mobile comparison.

Science889cebd hosted acceptance: Publish35022251587/Validate35022251639 succeeded. Both book launchers open one dialog with all five resource links; Escape closes it. Tina Science book resources: unsaved heading appeared inside the dialog, then explicit Reset restored original heading and disabled Save. No test save. One early hosted check ran before Publish finished and correctly saw the previous inline panel; it was retried only after deployment success.

Science topics follow-up: source `SciencePage.ss` and `scss/science.scss` specify three-plus-two centered items, green check circles, 14px semibold labels and a 300px book action. Added Science-only responsive CSS retaining the editable list. Desktop/375px local screenshots reviewed at4577; standalone Astro rebuild8663 succeeded following the preceding normal hosted-editor build. Source-reference typo corrected from ScienceHomePage.ss to SciencePage.ss. Topic follow-up hosted acceptance remains pending.

Science33938ce topic acceptance: Validate35022702871 and Publish35022702847 succeeded. Hosted computed layout confirms first three items share a row and last two share the next row, with14px labels. Initial reload before Publish finished still showed the earlier19px layout; no premature success claimed.

Science story overlays: `SciencePage.ss` specifies play icons for CERN/NASA and document icons for Cambridge/INFN. Added project-owned play SVG to existing IndustryIcon and Card icon choices, normalized it in the server model, and assigned the four existing cards their source-backed choices. Story rendering now supports an optional overlay from editable card.icon; image/link/title content remains unchanged. No catalogue functionality or new external destinations introduced. Existing Industry editor tests3/3 pass; Astro check270files0errorswarnings2hints. Normal Tina build stopped because the additive local schema was not yet pushed; local hosted-format compilation with --skip-cloud-checks plus Astro build passed. CI retains the normal remote schema gate. Local4578 screenshots reviewed desktop/mobile with four image requests fulfilled from normal authenticated hosted bytes because local R2 is empty; these image overrides are not hosted acceptance. All four overlays render; focus/hover receives the source blue highlight. Deployment and Tina icon-choice acceptance remain next.

Science icon schema correction: Publish35023135583 failed at Tina's remote-schema check while Validate35023135492 passed. `tinacms build` does not regenerate tina-lock.json; `tinacms dev -c true` regenerated it. Parsed lock diff contains only the added play option. Committed lock separately inbc72e6c. Normal hosted Tina/Astro build65362 then passed without skipping checks; industry-editor tests3/3 pass. Do not treat the failed deployment as hosted icon acceptance.

Science hero follow-up: production mobile computes42px/46.2px heading,24px/26.4px subtitle and right-centered background, whereas Astro previously reduced these to32px/20px and centered the crop. Added Science-only typography, right crop, mobile30px top spacing/95%-width resource panel and desktop spacing. Local4579 desktop/mobile hero screenshots reviewed using verified hosted image bytes to compensate for empty local R2. Header/global announcement differences and decorative Science breadcrumb/photo-credit treatments remain separate. Hosted hero/CMS icon acceptance pending deployment.

Science bb5fd22 hosted follow-up: Publish35023617743/Validate35023617734 succeeded. Mobile hosted hero computes42px heading and right-centered image; four story overlays present. Tina first CERN card: changed Card icon from play to document as an unsaved draft, verified document SVG in preview, explicitly Reset and confirmed play restored/Save disabled. No CMS save. This closes the scoped icon-edit/reset check; it does not certify every saved list permutation.

Science PDF delivery follow-up: production page links resolve to the two Swift Science PDFs; fresh HEAD requests returned200 application/pdf with no forced attachment header. Added inline disposition only to the two corresponding R2 registry entries, preserving bytes, SHA256 and filenames. Five existing media delivery tests pass; direct HEAD handler checks with actual registry entries and mocked R2 metadata confirm200 inline for both. Normal hosted Tina/Astro build passed. Hosted delivery/browser acceptance remains pending deployment; mock metadata checks do not certify remote bytes.

## September 15 — Science saved repeatable-card acceptance

Tested the hosted Tina editor at the immutable f999aef7 editorial Worker, using `cms/editorial-workflow-trial`. Observed Tina content request paths confirmed this branch before any save. Paid Editorial Workflow remained off; these are direct branch saves, not PR-workflow acceptance.

- Keyboard-reordered NASA from third to second, saved, verified Git commit `b6c96af2443f1ac8d539678e6160eaefdd2a012f`, then reloaded the editor. Both the persisted JSON and rendered Science story section had CERN / NASA / Cambridge / INFN order.
- Restored the original order through keyboard controls and saved (`a8dded81228554fee74bfc6de2ce559833473208`).
- Added a fifth card with a temporary heading, body and local Science destination; saved (`c21f7f47e2416e9fe3268e0a700b6cbad7199a6d`). Git and the reloaded rendered preview retained all five cards and the temporary copy.
- Removed the fifth card and saved (`ab56694fdce74c2fb7df3f43657790e173e4b201`). Reloaded preview shows the original four cards; Save is disabled. Parsed JSON is identical to main. Tina's serialization changed the blob hash, so restoration is semantic rather than byte-for-byte.

Main Science content remained at blob `49ff50ca658945109f73c72f9b79a029e0fff872`. No main CMS save, production business write, PR merge, or new branch build occurred. The trial branch has advanced, so its old successful immutable build is intentionally no longer the latest revision; the branch-preview resolver should report pending until a new build is started. This closes Science story-card saved list round-trip acceptance, not every page family's editor acceptance or paid Tina workflow acceptance.

## September 15 — Marketing nested resource saved-edit acceptance

On the same isolated f999aef7 editorial Worker, observed Tina API paths confirmed `cms/editorial-workflow-trial`. Opened Software release resources → Rocky → Presentation and temporarily edited only the resource label. Save produced commit `82be2810aabb802c4c30bb9fd35cee7c83bd1a54`. Git preserved the existing `/assets/marketing/Rocky-Release-Preview.pdf` destination. After editor reload, opened the historical-resources disclosure and software section in the preview: the edited label rendered as a link to that exact PDF.

Restored label `Presentation` and saved commit `80d98ac5b190f042a76a16305f790d59b2340974`. Full parsed Marketing JSON equals main; final editor reload shows the original nested resource and disabled Save. Main's original blob is `cb9bc9b8fd93847a8cf7470425354dcdd632a1ca`. This verifies nested label persistence, destination preservation, disclosure navigation and restoration. It does not establish saved add/remove/reorder for Marketing's nested resource list, every historical download, or a new deployed branch build. These are historical editorial files, not service-owned software release entities.

### Marketing nested list follow-up

Saved keyboard reorder (Presentation before Logo) and added a third resource with temporary label and `/marketing/` destination: commit `99a8b374879351e11e56b896191140648219839b`. Git and reloaded preview showed all three links in that order with their intended URLs. Removed the temporary resource and saved `adb69d8d69a58b65b01ceb1610f863a74f0ccf01`. The same rapid interaction sequence did not restore ordering; the post-save parsed comparison caught this, so it was not counted as restoration. After a settled reload, separate keyboard pickup/move/drop restored Logo before Presentation; saved `a7435b94ca41b73dfee66afbf40c871716a5bd9d`. Git then confirmed full parsed equality to main. Final reloaded preview showed the original two links, no temporary resource, and a clean Save-disabled editor. This closes saved add/remove/reorder acceptance for this nested list, alongside the preceding label edit. Main and service data remain unchanged.

## September 15 — Community production comparison and inherited Days link

Compared current production and Astro Community landing at 1440px. Hero text/imagery and contribution choices are present; both compute 34px/300/40.8px for the hero heading (Astro uses H1 where production uses H2). Astro's review banner adds vertical offset. At390px, expanded Frameworks for lifecycle management and switched Events, Users and Operators panels; visible panel labels/destinations were inspected and document width375px stayed within viewport390px. Native expandable project groups remain the intentional replacement for production's panel drill-down. This is representative interaction evidence, not all-page visual certification. An assumed production H1 selector timed out; the owned browser process was confirmed absent before relaunch, and subsequent reads used actual H1/H2 elements with short timeouts.

Found inherited OpenStack Days card URL `https://www.openstack.org/community/events/openstackdays` returns404 on production and corresponding Astro path. Production `/events/openstackdays` returns301 to openinfra.dev/days; existing Astro `/events/openstackdays` returns301 to `https://openinfra.org/days/`, which returns200 with title OpenInfra Days - OpenInfra Foundation. Corrected only the CMS-owned card URL to `/events/openstackdays/`, preserving its label/description and existing redirect ownership. `prepareCommunity` emits the intended local route. Full normal build and hosted corrected-card acceptance are recorded after completion; do not infer deployment from the source edit.

Community Days fix b278e30: normal build passed; Publish35033141915 and Validate35033141823 completedSUCCESS. Hosted Community Events panel now renders `/events/openstackdays/`; clicking navigates to the verified Foundation Days destination. Other contribution-link checks found old OpenDev `http://www.opendevconf.com/` returns404 and both HTTPS host variants return525. No replacement invented: added editorial workbook row14 with page/evidence links and blank staff-decision field. Software sample configurations resolve to the approved deferred-app notice, not functional catalogue acceptance. Other inspected destinations returned200 after redirects, which does not certify their historical copy or service behavior.

## September 15 — hosted Learn resources and responsive introduction

Compared current public Learn and protected Astro in Chrome at1440px; hero/card artwork, eight headings/copy/order remain aligned, with known shared-header/announcement/review-banner differences. At390px all eight card images decoded, document stayed within viewport, and keyboard Tab moved Training→COA with visible3px solid outline. Eight resource destinations returned200 after redirects; Marketplace/Videos/Blog are documented migration notices, not application acceptance. News resolves to Foundation Press, Superuser to its current domain.

Production introduction outer width is780px at1440,646.656px at1024,750px at800,375px at390 (30px total horizontal padding). Astro's fixed650px maximum unnecessarily narrowed desktop/tablet text. Updated only Learn introduction CSS to match the source's responsive widths; CMS copy is unchanged. Hosted corrected-width acceptance follows deployment.

Ask OpenStack returns200 but explicitly says the service closed in May2021 and lists mailing-list, Stack Overflow, Server Fault and archive alternatives. The migrated card still invites questions, matching stale production copy. Added editorial workbook row15 with Learn/official-status links, recommendation and blank staff decision; no support service or card-copy replacement chosen automatically. Sheet native values/links/wrapping read back; browser Google session remains signed out.

## September 15 — COA certification and handbook independence

Compared current production and hosted Astro COA desktop screenshots and rendered exam copy. Hero, nine training-partner logos, exam-detail headings/content and Caracal release image are preserved. At390px all nine partner logos decoded and the exam detail layout fit375px document width; screenshot reviewed. Registration/purchase actions and lab-test submission were not exercised. Training links continue to deferred Marketplace routes, not a production-service certification.

The handbook still linked to Swift. Retrieved the exact production-linked PDF (168,212 bytes, SHA256 `de0dd7beb3899688a57ae8def1dd3eab2c93c9617eded3d834f72ff41c7a45d6`). pdfinfo reports18pages/noforms/noJavaScript/noencryption; rendered cover confirms version3.0 effectiveAugust14,2025. Uploaded unchanged bytes to shared R2 using the existing reviewed-manifest uploader with new `--coa-handbook` option, then downloaded and matched size/checksum. Added Git publication registry alias `/assets/coa/The-OpenStack-Foundation-Certification-Candidate-Handbook.pdf` with inline disposition and changed only the editable handbook destination. Source manifest is `docs/coa-handbook-assets.json`; PDF bytes remain outside Git. Eight media/list tests pass. Full build/deployment and hosted delivery are checked separately; this is preservation of the public document, not legal review or a change to exam policy.

### September 17 — Enterprise sticky section navigation

Hosted comparison at `6661166` against production exposed a missing persistent
Enterprise section bar and Back to Top control. SilverStripe `EnterpriseHomePage.ss`,
`enterprise.js` and `scss/enterprise.scss` at `2172298` confirm the behavior. Astro
now uses native sticky positioning and a normal top anchor on the Enterprise
landing only, with keyboard focus styling and no jQuery dependency. The link is
available from initial rendering rather than hidden until scrolling. Editorial
content and other industry pages are unchanged. Local and hosted acceptance for
this patch are recorded in the vault handoff; this source note alone is not proof
of deployment.

The comparison also records remaining differences: shared header/banner spacing,
thinner replacement check icons, and the descriptive production title “Enterprise
Adoption of OpenStack” versus Astro's “Enterprise | OpenStack”. Hero imagery and
feature/report content were inspected, but this is not whole-page visual parity.

## Search follow-through — September 24 (local, not browser verification)

Search no longer labels the implemented Videos root as pending. Historical detail
results retain an explicit destination-migration notice. Marketplace results now
state that production catalogue refresh is pending, distinguishing that gate from
implemented browsing. Next stops at the service's1000-page bound; empty/error
searches no longer expose misleading previous/next navigation.

Astro check:354files,0errors/0warnings/2hints. Normal TinaCloud/Astro build passes.
Fresh local Worker4678 returns200 for empty-query/page2 (noPrevious) and Rackspace
(two updated Marketplace labels, no old label). Initial check hit an older server
on4593; that observation was discarded after the new process reported port-in-use.
No existing server was stopped. Parameter bounds checked at999/1001/negative input.
User-Chrome visual and hosted deployment verification remain outstanding.
