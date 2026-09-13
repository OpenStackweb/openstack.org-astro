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
