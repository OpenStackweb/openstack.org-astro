# Marketplace integration into Astro

Source: `OpenStackweb/marketplace-site` at `17df1c13e4f79541025258aafe9ccb1f30c7ffbd`, inspected September 17, 2026. JP supplied `https://oifapi.openinfra.dev` as the API base. Public responses establish access, not production data completeness or backend independence from SilverStripe.

## Current implementation

Astro owns `/marketplace/`, category/provider routing and the shared site layout. React owns interactive search, filters, the cloud map and driver table. `ServiceBox.jsx` and its styles adapt the existing Marketplace service card, replacing its Gatsby/MUI shell dependencies with plain markup. Google Maps uses the same React Maps library as the source app. This is an incremental extraction, not a claim that every original component has been ported.

`npm run marketplace:refresh` explicitly fetches all seven public catalogue families into `src/lib/marketplace/catalog.json`. Pagination fails closed on missing/duplicate records, inconsistent totals and HTTP errors; the snapshot is replaced only after every category passes. Builds do not silently refresh the API. The public projection retains review display names and excludes full author profiles, authentication material and fields not used by the current UI. No authenticated API requests or writes are implemented.

September 17 snapshot: 14 public clouds, 10 hosted private clouds, 12 remotely managed clouds, 23 distributions, 24 consultants, 9 training providers (25 courses), 188 drivers. Basic provider details include overview, service capabilities, supported regions, locations and training course summaries. Drivers retain release references. Category filtering and map markers use the same filtered records.

These records remain service-owned and are not registered as Tina collections. Refreshing a snapshot does not update the source service. No logo/media bulk export or production data mutation occurs.

## Google Maps

`GATSBY_GOOGLE_MAP_KEY` is read from the Astro Worker's environment and passed only to the Marketplace map. Its value is not stored in Git. This is a browser API key and is necessarily visible to the browser; host restrictions remain important. JP supplied it through ignored `.env`; it was installed on the Astro Worker using Wrangler's secret input. Preview versions without the binding retain the provider list and show a map-configuration notice.

Local browser testing observed `RefererNotAllowedMapError` on localhost. Map authentication/load failures now show a readable fallback while browsing remains usable. Hosted Astro acceptance passed September 17: tiles and provider markers rendered without authorization errors. The supplied key accepts the Astro hostname.

## Acceptance and remaining scope

- Public API access, all-page pagination and projected snapshot creation passed.
- Local catalogue/index routes returned 200; an unknown category returned 404. Known historical inventory destinations without a match retain a migration explanation.
- Local public-cloud search and clear/reset, provider navigation and 390px horizontal-overflow check passed. Further driver and hosted checks are recorded in the vault session log.
- Tests cover duplicate/incomplete/changing pagination, unsafe URLs, zero coordinates and exclusion of review/credential fields. Full existing suite passed with 153 tests before final UI copy/label changes.
- Detail expansion: sanitized company/service descriptions, pricing options, supported hypervisors/guest systems, consultant expertise/services/languages/clients, case-study/resource links, and training projects/levels/online status/schedule dates are now projected from the existing API contract. Course anchors retain `course_{id}`. Dates are Unix seconds rendered explicitly in UTC; missing dates are labeled. Provider detail markup lives in a dedicated Astro component.
- Still required: full per-release capability matrices, review submission, complete source-design parity, administrative permissions, production data approval and refresh operations. The site clearly labels this as an integration preview.
- Public reviews and provider videos now render from the API snapshot. Review comments remain escaped text; only public display attribution is projected from expanded authors. YouTube embeds require valid 11-character IDs and use the privacy-enhanced host. The September 17 snapshot contains 10 reviews and 17 video references across categories (references may repeat across services). Browser checks verify rendering, not the long-term availability of externally hosted video playback.
- Cloud and driver lists preserve the original hash filter keys, restore them on arrival/hash navigation, update shareable URLs and clear them on reset. Cloud locations now include the original city/state/country labels alongside country/region options. Dedicated pure filter helpers have compatibility tests; browser checks cover initial hydration, changed hashes, reset and provider-name searches.
- Training now lists individual API-owned courses with provider, location/virtual-course and level filters. It preserves `company`, `city`, and `level` hash links (case-insensitive matching), links to `course_{id}` sections, and displays COA partner status supplied by the company record. Courses without published dates remain discoverable with explicit provider-contact text rather than fabricated availability.
- Existing review submission in the source app uses visitor OAuth and the Summit API service-review endpoint. It stays disabled here until scope, permission and safe test acceptance are agreed.

No claim of full Marketplace or SilverStripe administration retirement is made by this browsing integration.
