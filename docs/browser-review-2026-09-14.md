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
