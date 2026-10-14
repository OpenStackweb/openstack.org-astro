# OpenStack page edits review

October 14, 2026. JP supplied the complete `OpenStack.org Page Edits-2.docx`
export, including its single embedded screenshot and five comments. Implementation
base: deployed Astro commit `711e31354b6bf539c18aa508201890160a29990a`.
Release branch: `release/page-edits-2026-10-14`, isolated from the local
`feat/page-edits-2026-10-14` checkout. JP authorized publication on October 14.
Earlier uncommitted search/YouTube work remains in the original checkout and is
excluded from this release. Publication targets the protected Astro review site
through the existing main-branch GitHub/Cloudflare workflow.

JP clarified: leave proposals for review and implement concrete edits. Missing
replacement copy is tracked below rather than invented.

## Implemented edits

| Area | Result |
| --- | --- |
| Homepage spotlights | Equal logo bounds, aligned text rows and aligned buttons using a responsive grid. Current Astro source is the old `spotlight.json` snapshot, not a live membership API lookup. It currently selects Cleura, not the screenshot's Cisco. This task does not certify membership freshness. |
| Homepage figures | Applied supplied 300+ public-cloud and 45 Million+ core copy. |
| Homepage case studies | GEICO, Hyundai, Dawn in the requested order. GEICO/Hyundai use existing service records. Dawn is a separate Tina-editable homepage feature; it does not fabricate a catalogue/service ID. |
| Home and Software diagrams | New vector asset reuses the established infrastructure drawing, adds Ansible/OpenTofu and Web UI/OpenStack CLI/REST APIs. No Cloud Foundry label. OpenShift remains a proposal. Software diagram links to its full-size image. |
| Software overview | Existing supplied paragraphs already matched. Corrected Landscape capitalization, extra whitespace and case-study destination. |
| Get Started | Deploy, Contribute, Learn sections; Try and Next Steps hidden through editable controls. Supplied user-story copy and YouTube channel destination applied. Existing hidden content retained for reversible editorial control. |
| Project Navigator | Display projection places Storlets immediately after Swift in Storage and removes the empty Add Ons section. Original records/detail URLs retained. |
| Deployment Tools | One Frameworks for Deployment and Lifecycle Management heading; Kolla-Ansible then OpenStack-Ansible, matching visible short descriptions; Puppet included; packaging section omitted; Bifrost visible wording updated. Sunbeam links directly to its documentation as a resource, without inventing a service record. |
| Roadmap | Existing 301 redirect to selected governance goals retained. |
| Use Cases | Existing Tina page collection retained, supplied introduction applied, blank video ID now removes the entire hero video and leaves gallery interactions working. CMS story visibility hides Baidu and the older duplicate Atmail record without deleting service records. Snapshot already has one Walmart record and current GEICO/Hyundai. |
| Bare Metal | Correct OpenDev button, supplied company-logo removals, ecosystem@openinfra.dev, four supplied Ironic videos. Titles verified through YouTube oEmbed; four thumbnails stored in Git. Existing testimonial retained pending replacement. |
| Containers | Three supplied replacement videos, verified titles, Kuryr link. Existing quote and survey graph retained pending replacements. |
| Edge | Supplied title/introduction, latest whitepaper pointer, LF meeting link, mailing list and wiki; OpenDev/Fog sections and other-groups blocks removed; supplied videos/articles substituted; 2017 report replaced with meeting CTA. Existing Why OpenStack prose retained, mailing link corrected. |
| Community | October 14 deployed Tina editing already fulfills the page-content request. |
| Marketplace tabs | Existing illustrated category style and red active underline, responsive wrapping, source category order. Category icons have Tina preview islands. |
| Marketplace shared resources | One Tina shared-sidebar document replaces seven independent help lists; heading is OpenStack Resources. Rendered on home, categories and provider details. |
| Marketplace UI | Add me to the Marketplace CTA at the top; review display and filter controls removed. Company colours and API qualification flags retained; OpenStack Compatible graphic in shared resources. |
| Marketplace landing | Editable H1/introduction, repeatable cards and columns, section visibility/order. Local Tina saves exercise adding, moving and removing cards/blocks. Existing CTA links assign blocks to available categories. |
| Supporting Organizations | Existing Tina sections have editable descriptions. Service membership tiers and company qualification remain outside editorial ownership. |
| SEO and navigation | Existing SEO controls and Tina-managed global navigation/footer retained. No forced external SDK redirect. |

Dawn source: [Intel's November 2023 announcement](https://www.intel.com/content/www/us/en/newsroom/news/intel-dell-power-uk-fastest-ai-supercomputer.html).
The summary avoids treating the article's historical fastest-supercomputer claim
as current. The linked public image is credited there to Joe Bishop for Cambridge
Open Zettascale Lab. GEICO and Hyundai copy/images come from the existing catalogue.

Navigator changes are **website presentation**, not Software API database writes.
Detailed historical service descriptions and release membership are unchanged.
Upstream catalogue corrections and a genuine Sunbeam service record need the
Software service owner. The current approved snapshot remains Dalmatian development
data and retains its existing preview notice.

## Items requiring content or service review

| Request | Remaining input or decision |
| --- | --- |
| New Use Cases: KT Cloud, NASA, Lidl; optional Lidl/BT/Worteks homepage alternatives | Approved case-study links, summaries and images. GEICO/Hyundai already exist; Dawn homepage feature now has a verified source. |
| Workday, Walmart, LINE, Kakao, China Mobile, CERN, Bloomberg, Oath/Yahoo updates | Replacement copy/links and intended catalogue records. The document names organizations but does not supply those updates. |
| Bare Metal and Containers quotes | New approved quotation and attribution. |
| Containers survey graph | Approved current data/asset and cycle. No percentages fabricated. |
| Containers five videos | Only three replacement URLs supplied; those three are applied. Two further selections require input if five is still intended. |
| User Survey wording, 2025 deadline, report/case-study sections and four copy comments | Current Astro Survey/Analytics routes are migration notices for separate applications, not the legacy forms/report UI. These edits require mapping to the accepted Survey integration and cycle; no 2026 questionnaire or deadlines were changed. The requested copy is preserved in the source document. |
| Analytics Block Storage readability | The referenced analytics graph belongs to the legacy reporting application. Its replacement/native graph and data contract need service integration; changing the unrelated historical story charts would not fix that page. |
| Have Jimmy review | Editorial follow-up. No message was sent. |
| Map automation and gatekeepers | Astro consumes an approved Software snapshot; staff refresh creates a candidate PR and merge publishes through the existing workflow. See [catalogue refresh](software-catalogue-refresh.md). Named upstream OpenDev gatekeepers were not verified. |
| Membership freshness/Cisco | Astro currently selects Cleura. Refresh/selection policy needs current membership-service evidence before claiming all displayed sponsors are current. |

## Proposals left for review

SDK redirect, OpenShift in the diagram, left-menu placement controls, category
CRUD/Adjacent Solutions, provider self-service and paid listings, marketplaceadmin
replacement, reusable page templates, a searchable cross-site media library, and
membership-level CRUD tied to Sponsor Management remain proposals. Existing Tina
media upload/reuse is not a new global searchable asset service. COA has no supplied
edit instructions in the export.

Recommended ownership: Tina controls editorial pages, display order, resources,
icons and presentation; DRF services retain provider/company records, identities,
entitlements and membership tiers. Review the Marketplace/Survey source behaviors
and service contracts before implementing application replacement or payments.

## Validation and preview

Local preview: `http://127.0.0.1:4390/`. Local Tina:
`http://127.0.0.1:4390/admin/index.html`. Node 24.21.0.

- Full Node suite: 211 tests passed. Focused schema, industry, removable-video and
  navigator tests passed after subsequent visual fixes.
- Final Astro check: zero errors/warnings, two pre-existing importer hints.
- Full Astro server build passed with hosted Tina credentials explicitly absent.
  Local Tina schema/index/editor generation passed. Hosted branch indexing/editor
  build and publishing remain release-time checks; they are not claimed here.
- `check-page-edits-save.mjs` performs real loopback-only Tina GraphQL saves and
  restores all four documents byte-for-byte. Add/reorder/remove, video clearing,
  visibility and field preservation passed.
- `check-page-edits-preview.mjs` checks transient previews for video removal,
  visibility, block order/removal, cleared cards, shared links and category icons;
  default content remains unchanged. Both scripts passed.
- Safari inspected the local homepage spotlights/case studies, Software overview,
  navigator/deployment ordering, Marketplace against the live source, Use Cases
  search and video removal, Containers replacement videos, Bare Metal and Edge.
  Narrow-window plus browser-zoom checks cover Marketplace, Edge and Use Cases.
- Native gallery search returned GEICO; search remained functional with the hero
  temporarily removed. The original video was restored afterward.
- Safari selected the shared-resource form directly from its preview heading.
  Category and landing-block order controls expose sortable items. Keyboard
  reordering moved Drivers to the first landing block and the live preview
  changed accordingly; Reset discarded the test and Save returned to disabled.
- A cold-cache Marketplace request exposed late dependency optimization loading
  two React copies in the Worker dev runtime. Explicit initial optimization of
  React, Maps, HTML parsing and Tina helpers fixed it; the first request after
  deleting only generated Vite cache rendered actual provider listings. No package
  versions changed. See [Vite dependency optimization](https://vite.dev/config/dep-optimization-options.html)
  and [dependency deduplication](https://vite.dev/config/shared-options.html#resolve-dedupe).
- Local R2 cache was seeded from public original files only after matching the
  registry SHA-256 and byte length. No remote bucket objects were written. Some
  unrelated local assets remain unavailable; hosted asset parity is not certified.

This release preserves Cloudflare Access and the existing review hostname.
The unrelated search/sitemap/legacy-video work is excluded. Hosted publishing
and verification results are recorded in the vault handoff after the CI release.
