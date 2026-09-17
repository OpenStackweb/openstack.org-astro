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
- Still required: review submission, complete source-design acceptance, administrative permissions, production data approval and refresh operations. The public-cloud source uses capabilities for pricing and service filtering; it does not render the full per-release matrix previously listed here as a generic parity requirement. The site clearly labels this as an integration preview.
- Public reviews and provider videos now render from the API snapshot. Review comments remain escaped text; only public display attribution is projected from expanded authors. YouTube embeds require valid 11-character IDs and use the privacy-enhanced host. The September 17 snapshot contains 10 reviews and 17 video references across categories (references may repeat across services). Browser checks verify rendering, not the long-term availability of externally hosted video playback.
- Cloud and driver lists preserve the original hash filter keys, restore them on arrival/hash navigation, update shareable URLs and clear them on reset. Cloud locations now include the original city/state/country labels alongside country/region options. Dedicated pure filter helpers have compatibility tests; browser checks cover initial hydration, changed hashes, reset and provider-name searches.
- Training now lists individual API-owned courses with provider, location/virtual-course and level filters. It preserves `company`, `city`, and `level` hash links (case-insensitive matching), links to `course_{id}` sections, and displays COA partner status supplied by the company record. Courses without published dates remain discoverable with explicit provider-contact text rather than fabricated availability.
- Category and provider pages share `ProviderMap.jsx`. Detail maps fit the provider locations and expose region names, public API endpoints and availability zones; equivalent text links/lists remain available without Maps. The snapshot has 157 location records, including 37 with endpoints and 24 with availability zones. OpenStack Powered/Ironic/federated identity/COA partner flags are carried through from the API.
- Existing review submission in the source app uses visitor OAuth and the Summit API service-review endpoint. It stays disabled here until scope, permission and safe test acceptance are agreed.

No claim of full Marketplace or SilverStripe administration retirement is made by this browsing integration.

## Editorial ownership

The seven category pages have a separate Tina `marketplacePage` collection in `src/lib/content/marketplace/`. It preserves the existing microsite browser titles, driver introduction, resource links and contact copy. Staff can edit category headings, introductions, search descriptions, resource lists and contact calls to action. API records remain outside the collection. Category rendering uses a Tina Astro island so editing page copy does not require a React content rewrite. Inline contact links support `mailto:`.

Source help links and contact destinations are preserved for editorial review; their import is not a certification that every historical destination or booking owner is still current. The Marketplace landing page now has its own Tina collection, preserving deployment-choice groups, hybrid-cloud guidance, consulting/training cards, driver guidance and the spotlight FAQ from the microsite source. Seven small source SVG icons live in Git; editable replacement media can use the existing R2 media store. Provider detail headings, calls to action, schedule labels, review labels, and qualification badge images/descriptions now have a shared `marketplaceDetails` Tina collection. The qualification flags still come from the API. The source relative Ironic `bare-metal` link was normalized to `/bare-metal/`. Service specification headings are also editable through stable keys, while their values remain API-owned. List/filter labels are application UI, as in the source microsite; they are not missing CMS fields. The obvious source typo “on-side hardware” was corrected to “on-site hardware”; the spotlight FAQ’s operational claim remains for editorial confirmation.

When changing Tina collections or fields, run `npm run cms:schema` and commit the regenerated `tina/tina-lock.json` together with the schema. TinaCloud indexes this lockfile; changing only TypeScript collection definitions causes the normal build's schema check to fail. This local-only command exits after generation/indexing and does not start an editor server. Keep the hosted build's cloud checks enabled.


Provider pages render two pure Astro Tina islands around the independent React map. This keeps the map mounted during editorial updates and avoids requiring a React renderer in Tina’s server-side preview container. The shared labels collection opens a representative public-cloud provider; staff can also navigate to training or consulting details to see the relevant fields. Review-submission status is deliberately application-controlled, not editable copy that could imply writes are enabled.


Provider and training lists now preserve the original microsite’s Fisher–Yates shuffle after hydration. Each mounted list keeps that order while filters change; the driver table retains explicit column sorting. The initial server/client render uses the same snapshot order to avoid a hydration mismatch. Company commitment attribution is projected from the public company record and rendered as escaped text alongside its commitment. A September 17 refresh retained all 280 records; apart from refresh time, public attribution and specification keys, it matched the previous snapshot exactly. The first refresh received a transient HTTP 502 and left the prior snapshot intact; the retry completed all seven categories.

Provider SEO metadata is derived from the same public service description, with category-qualified titles and a nonempty fallback. The rendered SEO audit includes the landing page, all seven category pages and all 92 provider pages in the current snapshot. These remain protected/noindex and held from the offline launch sitemap until production service acceptance; API-derived copy is not a new Tina-owned provider record.

## Consulting filter parity — September 17

Source `src/pages/consulting/index.js` has a separate service-region filter, and `gatsby-node.js` expands `services_offered.region`. The initial generic cloud controls omitted this relationship. The public snapshot now projects only each offering's service label and region label; the refreshed 24 consultants contain 198 associations. The other snapshot fields matched the prior export exactly.

Consulting exposes Office location, Service offered and Service region controls, retaining distinct `location`, `service` and `region` hash parameters. Like the source app, choosing both service and region matches either, with an explanatory sentence; text and office constraints still apply. Office selection accepts an exact full location, city, state, country code or country name. It does not broaden a full-city selection to all offices in that country, an ambiguous behavior in the older source. Incoming values not present in a dropdown remain visible as selected options rather than silently showing “all.” Provider details display service regions separately from the support-region list; these sets differ for 14 consultants in the snapshot and must not be merged. Both headings remain CMS-editable.

Local browser checks: Storage or Europe returns 16 listings; Storage alone returns 3; clear returns 24. Germany office-country link returns 3 and retains its selected value. Consultant service-region headings render, 390px layout has no overflow, and VEXXHOST cloud hash filtering still returns one provider. Production service/data and write/admin acceptance remain separate; these checks cover the approved public service snapshot and original microsite contract.

### Training schedule detail follow-up — September 17

Source `marketplace-site` at `17df1c13e4f79541025258aafe9ccb1f30c7ffbd`,
`src/templates/training/details/index.js`, renders city/full country name and
elapsed course days (`Math.round((end - start) / 86400)`). Astro now preserves
these details, including Tina-owned duration labels. Invalid, missing or reversed
dates show an explicit unknown duration. UTC dates retain their year to distinguish
historical sessions; past-session status does not assert current availability.
The source detail renderer passes city/country only to its location formatter, so
omitting street addresses here is not a demonstrated parity gap.

The read-only catalogue refresh changed 22 schedule location labels; comparison
against the preceding snapshot found no other record changes. API data remains
outside editorial collections. Provider course links retain responsibility for
registration and availability; no course booking or review write was submitted.

Data-quality item for the service owner: EasyStack's OpenStack COA Fundamentals
Shenzhen session spans May 15, 2016–June 5, 2017 (386 elapsed days), unlike its
three-day Beijing/Shanghai sessions. This is preserved API data, not an editorial
correction made in Git. Confirm or retire the old schedule in the owning service
before production acceptance.
