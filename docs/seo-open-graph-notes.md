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
