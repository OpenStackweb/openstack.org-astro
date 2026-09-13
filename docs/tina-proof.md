# Tina + R2 proof of concept

September 12, 2026. Authorized one-page evaluation, not a CMS selection or production release.

## Scope

`/cms-proof/` is an isolated copy of the homepage hero and three use-case cards. Tina edits only `src/lib/content/cms-proof/home.json`. The real homepage and API-owned datasets are unchanged. Native Astro components use Tina's HTML bridge; no React page rewrite. The refresh endpoint uses Tina's experimental Astro container helper, a dependency to evaluate before broader adoption.

TinaCloud project connects only OpenStackweb/openstack.org-astro. Editor branch: `cms/tina-proof`. The free account is sufficient for the initial editor/media test. Managed approval workflows and self-hosted backend parity are separate evaluations.

## Configuration

Local ignored `.env`: `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` (read-only content token), optionally `TINA_BRANCH`. Allowed site URL: `https://astro.openstack.org`. Never commit tokens. `npm run build` builds a hosted editor when credentials exist, otherwise omits the editor. It always removes stale local admin output first. The runtime receives only the public project identifier. GitHub CI currently validates without CMS credentials.

`npm run cms:dev` is the standard integrated development command. On this machine Astro/Cloudflare dev currently exits before startup; use separate `tinacms dev`, `astro build`, and built Wrangler preview on4390 with `--local --var CMS_LOCAL_TEST:1`. The authorization bypass additionally requires a loopback hostname and is forbidden in deployment config. Stop the Tina dev process before a hosted build because both use port4001/9000.

## Media ownership

Existing media browsing uses the approved Git registry, never a raw listing of private historical objects. Uploads accept PNG/JPEG/WebP/PDF up to10MiB, validate signatures, hash bytes and write only `cms-proof/<sha256>.<extension>` in the existing R2 bucket. Same-host `/cms-media/` serves these immutable proof objects; no existing object is overwritten or deleted. Images/PDFs stay out of Git; content records their URLs. Uploads are immediately visible to authorized review-site visitors; production publication/garbage collection remains a future policy decision.

Hosted list/upload requires a verified, enabled Tina user for this exact project, in addition to site-level Cloudflare Access. A reviewer Access session alone cannot upload. Same-origin POST required. Asset deletion deliberately fails with an explanatory message. POC new-object listing is bounded at1000 objects; production pagination/indexing must be designed before scaling.

## Evidence so far

- Chrome local native Astro visual preview: headline changes reflected live and Save updated isolated JSON.
- Chrome custom media picker opens with searchable registry entries.
- Local Worker integration: PNG uploaded into local R2, retrieved byte-identically, searchable afterward; cross-origin requests, unsupported methods, negative offsets and spoofed SVG rejected.
- Astro typecheck passed after integration.
- Hosted Git saving, actual remote R2 upload, PDF selection and full add/reorder/remove round-trip remain to be verified. Browser file upload permission initially unavailable.

## Evaluation notes

TinaCloud currently lists Team Plus editorial workflow at$49/month (monthly billing), while a separate workflow page still says Business/Enterprise. Confirm commercial terms before purchase. Tina self-hosted backend is Apache2.0, but not equivalent to merely hosting the Astro frontend on Workers.

CloudCannon has an official R2 DAM adapter; its documented public asset base URL still needs comparison with our private Worker-delivered asset paths. Keystatic's documented defaults are Git files or its own Cloud media, not a proven R2 adapter.

## Hosted checkpoint

TinaCloud has indexed `cms/tina-proof` successfully after an explicit Reindex. The configured site URL is correct. Hosted editor build passed; a by-value scan found zero occurrences of the read-only content token in `dist/client`. Astro check passed with zero errors/warnings/hints. Exclude generated `public/admin` assets from TypeScript diagnostics; checking the vendor bundles exhausts memory.

The editor and media endpoints are deployed on the protected Astro Worker. Cloudflare Access in the current Chrome session expired before hosted editor verification, so authentication, Git save and browser upload remain **unverified**, not passed. Local R2 integration checks are emulator evidence only. A remote binding preview attempt requires a workers.dev subdomain and was abandoned without enabling one.

Save targets `cms/tina-proof`; the public proof reads committed build content. There is no automatic publish pipeline yet. Review/merge the isolated content change into the deployment branch and rebuild to publish it. The on-page notice distinguishes live editing, saving to Git and publishing. Do not force-push the proof branch or overwrite editor commits.

## September 13: homepage and shared announcement

The editor now targets `main` of this independent Astro repository. The former `cms/tina-proof` branch is preserved but no longer the editor default. `/admin/index.html#/~` opens the real homepage. The proof collection remains available for isolated experiments.

Homepage schema covers the hero (including community Markdown), diagram, feature cards, release promotion, selected stories, Foundation text/logo and SEO title. Existing source story payloads were moved intact to `home-story-records.json`, outside the editable collection. A read-only combination with the 74-story catalogue offers75 choices, preserving existing selections; editors control selection/image/button, not underlying service data. Marketplace/member spotlights remain service snapshots outside this schema.

Navigation menu → Site → **Global — site announcement** edits the single shared record. `Show announcement` controls the large homepage banner and compact inner-page strip. Message, logo, additional text and link fields are shared. Turning it off does not remove the record or make its editor inaccessible. Normal visitors still render committed content without a TinaCloud runtime request.

`.github/workflows/publish-preview.yml` runs on main pushes or manual dispatch, serializes deployments, validates/builds and deploys only `openstack-org-astro`. It never changes www DNS/routes. Setup: repository secret `CLOUDFLARE_API_TOKEN`, secret `TINA_TOKEN` and variable `PUBLIC_TINA_CLIENT_ID`. The latter two are configured. **Cloudflare secret still absent**, confirmed September13; workflow stops explicitly before deployment. Once supplied, rerun workflow_dispatch and verify the whole path. Saves currently reach Git but need a local deployment until that credential is added. Production approval policy is still a future launch decision, separate from this protected review environment.

Chrome verified real homepage form, live headline update/reset, global banner toggle preview and off/on Git saves (restored on), feature creation and nested editing saved to Git. Temporary test card was removed afterward; all original fields and service snapshots preserved. Attempted automated drag/keyboard reorder was inconclusive, and tab detachment prevented completing removal through the editor (cleanup performed in Git). Do not claim the full repeated-item acceptance suite passed. Image/PDF upload verification remains open. Schema coverage tests ensure no stored homepage/announcement field lacks a CMS definition. Astro check passed with0errors/warnings/hints; build and Linux validation passed.
