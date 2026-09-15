# OpenDev 2020 travel archive

Reviewed September 15, 2026 against production, the supplied local database and
OpenStackweb/openstack-org commit `2172298743fe807a92758cf307059b69a7dba668`.

`OpenDevStaticVancouverLocationPage` inherits `SummitLocationPage`. Its template
renders CMS `TravelSupport`, `VisaInformation`, optional `CityIntro`/`Locals` and
venue fields. The last two are empty for this page. `Venue()` obtains the main
venue from the page's Summit rather than CMS body text. Record 3357 points to
Summit 28 and main venue 510; the read-only extraction matches the public venue
name/address. The source image is File 27205. No database writes, jobs or PHP
application were run; the isolated MySQL instance was shut down after extraction.

The live page retains planned Vancouver June 8–11, 2020 travel instructions even
though the landing advertises the subsequent virtual series. Preserve this as a
historical record, not current guidance. Both original Formstack application URLs
returned HTTP404 on September15. Their anchor text is retained with an explicit
historical-form-unavailable annotation; no application endpoint is implemented.
Other prose, selection-process/official-information links and existing photo
credit remain as published. The duplicated BC in the source address is retained,
not silently reinterpreted. The photo credit is preserved source text, not an
independent attribution certification.

The resulting page JSON is a rare Git-only archive, outside Tina's curated page
list. It uses the common editorial renderer and is registered in editorial paths,
so normal SEO/asset/link audits include it. The venue is an explicitly dated
snapshot, not a new authority for current Summit venue data. Upcoming event travel,
visa issuance or sponsorship purchasing would require an agreed service design.

Asset evidence: `opendev-travel-assets.json`; the original referenced photo was
visually inspected. Upload/readback verification is recorded in the session notes.
No production site or business data changes.

Local acceptance: normal build and Astro check pass (257 files, zero errors and
warnings, one existing hint); 100 tests pass. Desktop 1440 and mobile 390 reviewed,
one H1 and no horizontal overflow. The venue image was fulfilled from its private
verified file during local visual review; hosted rendering remains a separate gate.
R2 upload/readback size and SHA256 match. The 1,239-target SEO audit has no issues;
offline sitemap has 251 candidates/986 held. Expanded asset audit covers 228 source
pages and has no source errors or unresolved local references; registry coverage
now checks the actual media handler's allowed paths. Expanded internal-link audit
covers 231 source pages/720 targets, with no source errors. Deferred notices,
external destinations, query redirects and seven missing server-rendered fragments
remain explicitly classified; this is not a claim those targets are all complete.
