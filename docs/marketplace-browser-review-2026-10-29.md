# Marketplace browser comparison — October 29, 2026

Compared production openstack.org with protected Astro in Safari. Scope: landing
page, all seven category pages, representative provider details in each of the six
provider categories, and Driver table. This is not a manual review of every provider
or an endorsement of every external provider URL. The earlier API-only comparison
was insufficient to establish parity with the actual production website.

| Page | Browser finding | Change |
| --- | --- | --- |
| Marketplace home | Astro constrained the two deployment columns to a catalogue/sidebar width | Use full content width; retain CMS-owned copy |
| Training | Unrelated course cards, missing logos/descriptions and filters; long expired schedules | Group by provider, show current course table, company/location/level filters, detail links |
| Public Clouds | Cards/map render; missing search/service/location controls | Restore controls with URL hashes and filtered map |
| Hosted Private Clouds | Same missing controls and cramped resource sidebar | Shared filter/resource fixes |
| Remotely Managed Private Clouds | Missing name/service controls; COA badge incorrectly appears on non-training detail | Restore controls; training badge only on training pages |
| Distros & Appliances | Missing controls; legacy distribution/appliance URL has extra segment | Restore controls and redirect known legacy detail URLs |
| Consulting | Missing name/service/location/service-region filters | Restore independent controls using existing matching rules |
| Drivers | Table cramped by sidebar, missing filters | Full-width table with search/project/vendor/release filters; sorting retained |
| Provider details | Content and approved review display present; Astro uses stacked layout instead of production company sidebar | Retain readable layout, remove irrelevant COA badges, preserve existing snapshots |
| Shared elements | Resource links wrap awkwardly; fetch date mislabeled as catalogue update date | Block resource links; remove misleading timestamp; move join CTA to sidebar |

## Training data correction

Production browser shows seven current providers, including Mirantis and Red Hat.
The legacy public API omits providers 1 and 3, although live os_production marks
both active. Their imported staging drafts and eight ongoing online courses were
already present but unpublished. Live source comparisons verified names, ownership,
slugs, level, links and exact description hashes. A bounded first-publication
manifest restored only those two providers/eight courses; no other publications or
standing permissions changed. Operational evidence is in the deployment vault.

The new API now holds 12 published training providers / 33 courses; the directory
shows seven providers / 22 current courses. Expired classroom sessions remain in
historical provider data but do not become current training offers. A provider card
shows up to three courses and links to its complete detail page. Existing numeric
Training URLs redirect to the canonical provider URL.

## Verification and remaining differences

- Full local production build and Astro check passed; targeted Marketplace tests
  passed. Local dev Worker hit a React optimization duplicate-instance error; the
  built preview renders and hydrates successfully.
- Safari production-build preview: provider table layout, Mirantis company filter,
  combined Beginner filter (OS100 only), and shareable URL update verified.
- HTTP smoke: known numeric Training and distribution URLs return 301 to correct
  canonical paths; Driver page returns 200.
- Source/provider order is intentionally randomized. Pixel-identical ordering is
  not a parity criterion.
- Production uses clustered/badged map markers; Astro uses individual pins.
- Production's Write Review flow is not present in Astro. Displaying approved
  reviews does not establish submission/moderation end-to-end acceptance.
- Shared resource/CTA copy remains CMS-managed; some imported contact and calendar
  URLs differ from production and need editorial reconciliation.
- Safari narrow-window check at approximately 574px confirmed stacked provider cards, readable course table and resource links below the catalogue. A 390px mobile viewport and every external registration URL have not yet been certified.
