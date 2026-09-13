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
