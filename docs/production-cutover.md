# Production cutover preparation

Status: planning only; source-status review September 23, 2026. Production cutover is not approved.
The current deployment remains the protected Astro review Worker. This document
identifies work required before a separately reviewed launch; it is not an
executable runbook with verified production values.

## Current controls verified in source

| Control | Current location and behavior | Required launch work |
| --- | --- | --- |
| Public indexing | `public/robots.txt` disallows all crawling | Produce a production-specific policy; retain preview disallow |
| HTML indexing | `src/layouts/Site.astro` emits noindex/nofollow | Gate by deployment and route eligibility; keep admin, auth, review and unfinished routes excluded |
| Response indexing | `src/middleware.ts` sets X-Robots-Tag on responses | Coordinate with HTML and robots policies; changing only one is insufficient |
| Canonical identity | `src/lib/seo.mjs` uses www.openstack.org and verified aliases | Check each release route and translation against the approved URL inventory |
| Framework site origin | `astro.config.mjs` uses astro.openstack.org | Review all generated absolute URLs under a separate production configuration |
| Sitemap | Offline `docs/sitemap-review.json`; no served endpoint | Approve candidates, generate and validate a served sitemap; never include notices or development snapshots by default |
| Publication | Guarded deploy targets openstack-org-astro | Prepare a separate production target/configuration; do not weaken the preview guard |
| Access | Review host and editorial previews are protected | Keep these protected; public-site access policy requires separate approval |
| Assets | Shared R2 MEDIA binding | Verify public origin access, MIME, ranges and asset URLs without removing CMS write authorization |
| Media indexing and caching | `src/lib/server/media-assets.mjs` sets noindex/nofollow and private caching independently of middleware; CMS uploads reuse this handler | Review these headers alongside the HTML policy. Changing only middleware leaves published images/PDFs excluded; preserve protected preview and draft controls |

Check the paths against the release revision before implementing any switch.
Canonical tags pointing to www do not make the protected preview indexable.

## Acceptance dependencies

- Software: production service, dataset, identity/scopes, refresh and administration.
- Marketplace: fresh upstream import, refreshed site snapshot and repeated live
  comparison; moderation replacement remains a planned Django service/admin.
  Review writes remain disabled until its complete workflow is accepted.
- Deferred applications: explicit decisions and implemented or approved retirement
  outcomes for Speakers, Survey, profiles and licensing. A notice is not functional
  parity. Survey has a local Django/SurveyJS prototype; historical data, shared
  respondent authentication, runtime and staff acceptance remain incomplete.
- Videos: the approved cached YouTube discovery page replaces the `/videos/` notice;
  see [its implementation and operating limits](youtube-videos.md). Historical video
  URLs still need exact mapping or approved retirement outcomes. The old searchable
  SilverStripe catalogue is intentionally not reproduced; do not call it pending
  implementation of the same legacy app or assume every old URL is resolved.
- Blog: separate full upgrade project. Regardless of platform decision, preserve
  /blog/ origin routing and remove dependencies on retired SilverStripe assets.
- CMS: confirm staff permissions and branch/PR review ownership. Main saves create
  drafts; exact-revision branch preview dispatch remains manual.
- Database consumers: inventory remaining services reading SilverStripe tables.
  Retiring PHP does not authorize deleting its database or private records.

## Rehearsal and release evidence required

1. Select an immutable release commit and record built artifact identity, Worker
   version, approved public routes and completed service acceptance evidence.
2. Record current production origin/routing configuration and an owner-approved
   rollback procedure. Do not infer it from local historical configuration files.
3. Rehearse the production build on an isolated protected hostname with test
   identity callbacks. Check headers, redirects, canonical/OG identities, media,
   editorial workflows, application navigation and approved service operations.
4. Review the exact production routing, Access, indexing and identity changes as
   one release. Keep Astro review and draft preview configurations independent.
5. After an explicitly authorized cutover, verify anonymous public access, crawler
   policy, sitemap responses, social previews, authentication, blog and critical
   routes. Monitor actual error rates and agree rollback thresholds in advance.
6. Keep the former deployment available until the agreed observation period ends.
   Coordinate write behavior before rollback: a traffic rollback cannot undo or
   reconcile writes made to replacement services.

Production Worker identity, final origin mappings, launch owner, rollback
thresholds and observation period remain unconfirmed. Do not fill these with
assumptions or run production mutations from this checklist.

## October17 — remaining preserved source reconciled for review

Published main is e2c67bc. A read-only comparison of the preserved dirty checkout
found56modified/untracked files already byte-identical to main and20remaining
files across historical-video, search-suggestion, sitemap/planning and older
Tina integration work. The original checkout is preserved; don't reset it or
copy older middleware/Tina files over later Survey/editor safeguards.

This candidate carries4391 exact historical video redirects with a fresh status
check of all4390retained IDs, plus the existing search-result destination note.
No autocomplete/search-suggestions code is included; it remains separate work
requiring browser/keyboard/mobile acceptance. Legacy source freshness and
unmatched/conflicting historical routes remain distinct launch gates.

The offline283-URL sitemap now uses standalone unindented loc elements, matching
the existing Nutch extractor without changing canonical URLs or their order.
It remains an offline candidate; no sitemap is served and preview indexing stays
disabled. Search backend deployment/operator/index-freshness acceptance remains
open, including update/deletion/redirect/draft behavior. Source-only crawler
repairs are a separate draft PR and are not a deployed-index claim.

The older preserved Tina config and island route differ only by missing the
subsequently published Survey collection/introduction. Keep newer main versions,
including its generated lock. The original76source file fingerprints remain
unchanged after preparing this candidate; reconciliation does not discard local
work. Local all-route HTTP checks and218tests pass; browser visual acceptance,
actual search deployment/index freshness and final service/data release gates
remain open.


## October17 — current local release evidence

[The refreshed release audit](release-audit-2026-10-17.md) covers1,399metadata
targets,299link/asset source pages,253static accessibility pages and the515-route
fixedinventory. It finds no internalHTTPerrors, metadata/static accessibility
findings or unresolved localassetreferences. The current offline sitemap has284
candidates (Hibiscus added) and1,113held rows; it remains unapproved and unserved.
Exact visible UseCases identities respect the approved two CMS exclusions; no
website content changed. Browser, remote media, public indexing, service/data and
staff acceptance remain separate. This supplements the prior historical-video
acceptance and does not authorize public deployment or hostname changes.

## Explicit visitor identity profiles

The [production identity packet](production-identity-registration.md) prepares
exact www callback/logout/origin values while preserving the review host's
existing defaults. The production visitor profile requires explicit opt-in and
cannot run on review, beta or editorial preview hosts. This is not a production
Worker configuration or completed IDP/Survey/browser acceptance. No bindings or
registrations were changed by the source preparation.

## Separate Worker build preparation

[The production Worker candidate](production-worker-candidate.md) adds explicit
review/www build origins and a complete output fingerprint. The review deploy and
editorial upload paths reject production builds. Production preparation emits a
separate unroutable config with visitor activation off, no routes/public URLs or
schedules and no inherited private service credentials. Public registrations and
CMS ownership remain preserved; actual CMS/provider/service activation and public
indexing/routing are separate acceptance work. No production Worker is uploaded
or created by the preparation script.
