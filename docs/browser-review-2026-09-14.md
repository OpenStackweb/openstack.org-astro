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
