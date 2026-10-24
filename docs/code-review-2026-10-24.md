# Astro code and readability review — October 24, 2026

Repository: OpenStackweb/openstack.org-astro. Base: `44270c131c5d1e7fd075e837e93b34e7b5c6084a`. Candidate branch: `refactor/astro-readability-review`. Review was performed in an isolated clean worktree; the original working checkout was not modified. This report describes source and local verification, not deployment acceptance.

## Findings and disposition

| Priority | Finding | Evidence and disposition |
| --- | --- | --- |
| P1 — open | Dependency advisories need a focused update. | `package.json` / `package-lock.json`: the October 24 `npm audit --json` result identifies 46 affected packages: 4 critical, 28 high, 11 moderate, 3 low. Counts include transitive packages and propagated advisories, not 46 distinct exploitable defects. Tina 3.13.0 is directly listed under [GHSA-x34j-47hf-4xg7](https://github.com/advisories/GHSA-x34j-47hf-4xg7), concerning an attacker-controlled admin preview iframe origin. Validate patched Tina/CLI versions together with the local dependency patches and hosted editor. DOMPurify and proxy-addr are also critical entries; assess their actual shipped/runtime paths. No dependency versions changed in this cleanup. |
| P2 — fixed | Invalid Survey redirect URLs could escape as unhandled exceptions. | `src/lib/survey/gateway.mjs`: parsing the upstream Location header was outside error handling. An invalid URL now returns a private, noncacheable 502 without forwarding a Location. Regression test added. |
| P2 — fixed | Staff and participant pages duplicated security-sensitive asset loading. | `src/pages/user-survey/index.astro` and `staff.astro`: a shared `mount-workspace.ts` now owns manifest fetching, stylesheet loading, entrypoint mounting and failure presentation. `manifest.mjs` validates all paths before adding assets. Staff denial messaging, participant session events and canonical participant redirects are preserved. |
| P2 — fixed | Formatting did not cover most authored code. | The old format command covered Astro files, middleware and Astro config. It now covers authored JS/TS/React/CSS, scripts, Tina schemas, root configuration and workflow YAML. Validation and publishing CI enforce the same scope. Generated/imported data is excluded explicitly. Mechanical formatting is its own commit. |
| P3 — fixed | Nine unused modules obscured the current architecture. | Removed the old beta GitHub CMS callback, editor-record selector, conference feed generator, editorial redirect helper, schedule loader/calendar/filter helpers, Software React mounting wrapper and sample-configuration helpers. None had repository callers after checking imports, exported symbols, dynamic paths, routes and tests. Current route handlers and historical content/evidence remain. |
| P3 — improved | The Survey route allowlist was difficult to audit as one expression. | Split participant catalogue/response/deployment patterns into explicit groups. Existing method gates remain intact. Compared old and new behavior across 6,720 path/method combinations, and added persistent workflow/lookalike-path coverage. |
| P3 — open | IndustryLanding mixes several page variants and extensive scoped CSS. | `src/components/IndustryLanding.astro` is 2,192 lines, mostly styles. It remains the largest presentation hotspot. Split along named page sections/variants in a separate visual refactor; moving scoped styles mechanically can change selectors and cascade behavior. Size alone is not proof of duplicated behavior. |
| P3 — open | Dependency declarations are not consistently pinned. | `@astrojs/check` is `latest`, React type packages use a major range and Leaflet uses a caret range. The lockfile plus `npm ci` keeps current CI reproducible; regenerating the lock can change more than intended. Pin versions during the dependency update, with type/build verification. |

## Scope and approach

Inventory covered 409 authored source/tooling files (about 32,710 lines before formatting), plus dependency manifests, build configuration and workflows. Generated CMS files, imported JSON/catalogues and historical evidence were distinguished from maintained implementation code.

Detailed manual review concentrated on routing and middleware; the site shell and large presentation components; Tina adapters, island registration, media/release/software-refresh endpoints and preview tooling; visitor identity/session/affiliation boundaries; Survey mounting and gateway; Marketplace projection/loading; Software mounting and catalogue integration; search, media delivery, editorial sanitization/link handling and upstream restrictions. Import/reference searches identified unused modules. Existing tests cover additional content, schema, service and deployment contracts.

This is a repository-wide maintainability review with targeted correctness and boundary checks. It is not a claim that every line, third-party dependency, historical page or authenticated production workflow was independently audited. No live account writes, catalogue imports, survey submissions or deployments were performed.

Small explicit Tina adapters remain separate: they make content ownership and preview metadata visible. No generic loader framework was introduced merely to reduce line count. Editorial field names, saved content, generated catalogues, service ownership, permission gates and production configuration were preserved.

## Verification

- Baseline: 240 Node tests passed before logical changes.
- Candidate: 244 Node tests pass; `npm run format:check` passes; `npm run check` reports zero errors/warnings and four existing hints (two deprecated DOM helper uses and two unused test parameters).
- Full local `npm run build` passes. Without hosted Tina credentials it intentionally omits the editor build; this is not hosted CMS acceptance. Tina schema fields and lockfile were not changed.
- Browser: Chromium at 1440px and 390px checked home, Survey participant/staff pages and report archive for successful rendering and horizontal overflow. Screenshots were inspected. Synthetic same-origin service fixtures verified participant/staff mounting, session-driven introduction collapse, staff 403 messaging, invalid manifests, canonical staff-to-participant redirect, keyboard focus and absence of uncaught browser errors. These are integration checks of the loader, not live Survey backend acceptance.
- Route differential: 6,720 method/path combinations match the original allowlist.
- Python aggregation tests require Python 3.11+ (`hashlib.file_digest`). This Mac's system Python fails that prerequisite; hosted validation must confirm those three tests. README now states the runtime requirement.
- Dependency audit is an unresolved finding, not a passing check. No automatic audit fixes or advisory suppressions were applied.

## Recommended next work

First update and verify the dependencies, prioritizing the Tina admin advisory and deployed-client paths. Exercise hosted CMS login, visual preview, repeated-item editing and save/round-trip behavior with the patched versions. Then split the large industry template using visual comparisons. Keep those changes separate from this formatting and dead-code cleanup so behavioral changes remain reviewable.
