# Tina + R2 proof of concept

September 12, 2026. Authorized one-page evaluation, not a CMS selection or production release.

## Scope

`/cms-proof/` is an isolated copy of the homepage hero and three use-case cards. Tina edits only `src/lib/content/cms-proof/home.json`. The real homepage and API-owned datasets are unchanged. Native Astro components use Tina's HTML bridge; no React page rewrite. The refresh endpoint uses Tina's experimental Astro container helper, a dependency to evaluate before broader adoption.

TinaCloud project connects only OpenStackweb/openstack.org-astro. Editor branch: `cms/tina-proof`. The free account is sufficient for the initial editor/media test. Managed approval workflows and self-hosted backend parity are separate evaluations.

## Configuration

Local ignored `.env`: `PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN` (read-only content token), optionally `TINA_BRANCH`. Allowed site URL: `https://astro.openstack.org`. Never commit tokens. `npm run build` builds a hosted editor when credentials exist, otherwise omits the editor. It always removes stale local admin output first. The runtime receives only the public project identifier. The publish workflow builds with GitHub-stored Tina credentials; the separate validation workflow can omit the hosted editor.

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

`.github/workflows/publish-preview.yml` runs on main pushes or manual dispatch, serializes deployments, validates/builds and deploys only `openstack-org-astro`. It never changes www DNS/routes. Setup: repository secret `CLOUDFLARE_API_TOKEN`, secret `TINA_TOKEN` and variable `PUBLIC_TINA_CLIENT_ID`. All three are configured. Full publishing workflow34775196372 succeeded September13 for commit74ccc1f, deploying Worker1725be2b-9c7a-4846-8604-2a312f303762. Hosted Chrome verification confirmed content and the populated homepage editor after deployment. Main pushes now trigger this workflow; no GitHub environment is required. Production approval policy is still a future launch decision, separate from this protected review environment.

Chrome verified real homepage form, live headline update/reset, global banner toggle preview and off/on Git saves (restored on), feature creation and nested editing saved to Git. Temporary test card was removed afterward; all original fields and service snapshots preserved. Attempted automated drag/keyboard reorder was inconclusive, and tab detachment prevented completing removal through the editor (cleanup performed in Git). Do not claim the full repeated-item acceptance suite passed. Image/PDF upload verification remains open. Schema coverage tests ensure no stored homepage/announcement field lacks a CMS definition. Astro check passed with0errors/warnings/hints; build and Linux validation passed.

## Software administration handoff demo

The Software overview is available as **Software — page content and admin** in Tina. Opening its document previews `/software/` and places a display-only information panel above the editorial fields, with **Open Software development admin** linking to `https://software-api.devbranch.openstack.org/admin/` in a new tab. The user supplied this development URL for the demonstration; Chrome verified its Django login page. Separate login/permissions still apply.

Only existing `software-overview.json` copy, images, section links and navigation cards are editable. Releases and catalogue entities remain service-owned. The display-only panel is absent from generated GraphQL and saved JSON. The schema coverage check includes every current Software overview field to guard against data loss. This demo is contextual to the overview page; app-detail routes and Marketplace/Videos panels are not wired yet.

Native Astro markup/CSS is reused through the Tina island for live preview. Normal visitors render committed JSON without fetching Tina. Local hosted-editor build was validated with `--skip-cloud-checks` while the additive schema awaited its first Git push; CI uses the normal cloud schema check before deployment. No Software service data was changed.


### Imported editorial pages

The **Editorial pages** collection covers the 102 explicitly listed documents in `tina/editorial-pages.json`. It preserves titles, descriptions, existing HTML/Markdown bodies, archive notes and section links. The URL is retained as hidden metadata; create/delete and URL changes are not exposed. Every stored field is checked against the schema to prevent silent data loss.

Selecting a page opens its native Astro preview. The body currently uses an HTML/Markdown source textarea, not a visual rich-text editor. This deliberately retains the existing markup; a friendlier rich-text conversion remains future work. Normal visitors render committed content, with no Tina data fetch. During editing, the document-specific island reloads the same native renderer.

Complex industry layouts, summit event relationships, locations, sponsor snapshots and other structured page models are excluded until their own schemas and ownership reviews are complete. This collection does not edit application data or certify that every imported page now has full CMS parity.

Section links use an inline custom field with labeled text/destination inputs and keyboard-operable Up, Down, Remove and Add controls. This avoids Tina 3.13 retaining a deleted nested-item selection after Reset. Validation rejects empty labels, unsafe destinations and more than30links. It changes the editor UI only; the stored object-list schema remains unchanged. Other nested object editors still need their own reset acceptance checks.

Admin refresh policy: `/admin`, `/admin/`, `/admin/index.html` and `/admin/bridge.js` send `Cache-Control: no-store`. Static rules live in `public/_headers`; middleware covers Worker-generated responses. See [Cloudflare static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/) for why both paths are covered. Hashed assets retain their normal caching. This prevents new stale editor caches; an already-cached document may require one refresh to receive the policy.


FAQ preview prerequisite: `ArchiveFaq` uses a small custom element with scoped, delegated listeners and disconnect cleanup. Search and the contact dialog reconnect when a preview replaces the FAQ element; replacing its children also works. No FAQ collection is enabled yet, and no hidden historical questions were imported by this change.

For the local browser regression check, run the built Worker on127.0.0.1:4407, then `node scripts/qa/faq-lifecycle.mjs` and open `http://127.0.0.1:4408/__faq-lifecycle/`. This local-only fixture adds buttons to replace the actual Shanghai FAQ element or its contents. After each replacement verify a matching search, no-results search, topic reset and opening/closing the contact dialog. The fixture is not included in public assets.

Software overview now includes a plain-text **Search and sharing description** field. It is editorial metadata in software-overview.json; the schema-derived GraphQL selection includes it automatically. The page Layout uses it for both description and og:description. The field explains that it changes metadata after publishing, not the visible introduction. Tina's body-island replacement does not provide a live head-tag preview. Local schema-coverage tests and rendered Chrome metadata checks passed; a hosted editor save/deploy round-trip for this new field remains unverified.

### Editorial coverage inventory

`node scripts/audit-cms-coverage.mjs` produces [cms-coverage-audit.json](cms-coverage-audit.json) from the current editorial allowlist, generated schema and page files.212 page records:102 in the editor,110 excluded. No included record has an unrepresented top-level field or mismatched route. This is a source-coverage check, not nested-field or save/interaction acceptance; keep the schema round-trip tests and browser acceptance separately.

Excluded cohorts:57 archiveEvent pages;11 FAQ pages;10 sponsor pages;17 location pages (eight also have venueLinks);four highlights pages;11 industry/hero pages (six with newsletter and one with scienceBook). These are migration/modeling groups, not automatic proof of API ownership.

The57 archiveEvent pages are the largest editorial expansion opportunity. Their page copy references one of seven shared event records in archive-events.json. The native renderer applies withArchiveEvent to resolve shared navigation, introduction and resources. The current Tina EditorialPage preview calls only prepareEditorialPage, so simply widening its collection would lose shared rendering parity. Before enabling those documents: preserve the event reference in the schema, apply the same resolver in the preview, define the shared event editor, and verify page saves preserve the relationship while shared edits reach every consumer. Do not duplicate shared content into57 independent pages or strip the archiveEvent field. Broader event applications remain deferred.

Archive-linked page editor expansion prepared:57 existing page documents now join the editorial collection (159total;53still excluded). Their hidden archiveEvent field is retained on saves, and the Tina preview now calls the same withArchiveEvent resolver as the normal page loader. Section-link controls explain the shared source instead of accepting page-specific navigation edits that the resolver would ignore. No source page content or shared event records changed. Schema coverage tests validate every stored field and unique event references; all57 pages' normalized main text and anchor targets matched before/after local builds. An initial comparison needed consistent null normalization for named anchors with no href; rerun passed. Chrome confirmed Vancouver lunch menus retain their shared sidebar. Local typecheck passed. Hosted editor save/reset acceptance remains pending indexing/deployment; the shared-event editor itself remains unfinished. This expands page-copy editing, not administration of event applications.

Shared archived-event editor implemented locally: **Shared — archived event content** contains seven fixed documents, each with its shared introduction, resources and navigation. Event identity is stored as eventId (Tina reserves id for its document identifier), hidden from the form; create/delete are disabled. A registered related page provides the preview. Page and shared-event selections travel in the same Tina query, and the island receives the unsaved shared record as a resolver input. Navigation reuses the inline link editor. Hosted selection/save/reset and cross-page deployment acceptance still need testing after TinaCloud indexing.

The old archive-events.json was separated into seven files under content/archive-events and an archive-event-landings.json holding the unchanged historical landing data. archive-event-content.mjs reconstructs the original runtime shape. Deep comparison against the pre-change data proved all seven reconstructed records identical; all57 rendered consumer pages retained main text/link targets. Landing-page fields are preserved but are not exposed by this shared editor. Five tests pass, including a draft change reaching14 Vancouver consumers without changing43 other event pages. Typecheck142files clean; local Tina build uses skip-cloud-checks while the new schema is unpublished, followed by a successful Astro build and full route audit. No hosted parity or save-round-trip claim yet.

Local browser acceptance found/fixed shared-form selection: a collection router opening a normal content page selected that page's form, and the admin dropped a query parameter intended to select shared context. Shared records now open an allowlisted `/cms-preview/event/{id}/` route, with the shared document first in both query and data. The island POST preserves that context. Page editing still opens the page form. Comparison/canonical links on this editor preview point to the represented content page.

Verified with Tina local backend in Chrome: shared collection → Vancouver selects event fields; editing introduction updates the unsaved preview; Save writes only the introduction to its local JSON; a second consumer page shows the change. Clearing that field back to empty through automation repeatedly left Save disabled and did not persist a restoration, including after reload. Cause is unconfirmed (editor state versus automation); this remains an acceptance gap. The exact original JSON was restored from a pre-test copy and the second page no longer shows test text. No test content was pushed. Do not describe this as a successful full save/reset round-trip.

Local development setup note: Astro7 detects the agent environment and daemonizes `astro dev`, so Tina's `-c` child supervision exited before readiness here. Running Astro dev and `tinacms dev` separately works. The local editor explicitly reports filesystem saves; generated client uses localhost:4001/graphql. Hosted builds must regenerate the hosted admin; never deploy the local-mode editor assets.

After stopping the local Tina backend and Astro daemon, the normal scripts/build.mjs completed successfully with TinaCloud checks enabled. Cloud indexing had caught up; the earlier schema blocker is cleared as of this build. This regenerated hosted admin assets after the local-mode test. The editor-context fix is ready for preview deployment, while the empty-field restoration acceptance gap remains open.


### Explicit clearing of optional shared copy (September 13)

Shared introduction and resources now have a labeled textarea and an explicit Clear button. This does not establish that Tina’s default textarea has a storage bug: the earlier automated empty-fill behavior remains unexplained. The custom control makes the intended operation visible and repeatable.

Chrome with the local Tina backend verified resources Clear → Save: the optional field was omitted from JSON and its link disappeared from another Vancouver page. Restoring the original HTML → Save restored the link and all original values. A further Clear → Reset discarded the unsaved change and returned Save/Reset to disabled. Original file formatting was restored after verifying semantic equality; no test data remains. This acceptance covers the local resources field, not hosted Git publishing or every editor field. Local servers were stopped afterward.

The config override is explicitly narrowed to string fields, so the text component cannot be assigned to navigation lists. Astro check passes across145files; all five schema/shared-consumer tests pass. Hosted acceptance remains pending.


### Industry editorial pages (September 13)

Eleven template-owned industry pages now join the explicit editorial allowlist (170 of212 imported page records;42 still excluded). The schema preserves hero settings, section types/backgrounds/anchors, ordered cards/items/rows/blocks, facts, links, images, newsletter labels and Science book/PDF destinations. API records are not introduced into the CMS. Source classification: vault reference/industry-content-preflight-2026-09-11.md. Newsletter editing changes copy only, not the external subscription contract.

The Tina preview selects IndustryLanding just like the public route. Metadata preserves absent optional objects as null instead of manufacturing empty heroes/forms on unrelated pages. Industry parsing accepts null optional text/lists returned by Tina. Seven schema/draft tests pass, including recursive coverage of all170documents and null-filled rendering equivalence across all11industry records. Draft model tests cover section ordering and Science PDF destinations; they do not certify the actual media picker. Typecheck147files clean; hosted-format local Tina build and Astro build pass. Local route audit passes212editorial routes plus redirects/key routes/unknown404.

Chrome local acceptance: Science built route retains full industry layout and book action. In the isolated local Tina backend, Telecom collection entry opened the correct industry preview. Editing a nested section heading and saving changed only that value, including the visible preview. Save returned to the page-level form; reopening the section and saving its original heading restored every original value. Original JSON formatting restored after semantic equality; no test content remains. Astro22227 and Tina22112 stopped afterward.

Remaining acceptance: add/remove/reorder/reset through the nested UI, mobile/editor layout, Science R2 media selection/upload, newsletter/browser validation without subscription, and hosted Git save/deploy roundtrip. Optional layout panels currently appear on the editorial collection; their absent values stay absent on save. This is expanded editorial capability, not complete administrative parity.

### OpenStack for AI dedicated landing editor

OpenStack for AI now has a dedicated singleton collection and native MarketingLanding visual preview. It covers the hero/buttons, quotations and attribution, contributor selections, working-group promotion, carousel labels and published search/social description. This is additional to the170/212 imported-page cohort; dedicated landing pages are not counted there.

The Gatsby source at marketing-site dc9f57b5bd5dc4c99ade19e065fbff354651ef6f defines these editorial sections and an AsyncSelectWidget backed by the Summit public companies API. Tina currently selects only the nine reviewed company records already used by this page. Company names/logos/URLs stay in the service snapshot. Live service search, adding previously unreviewed companies and production source freshness remain gaps.

Tina reserves id, so the nested numeric field uses companyId with nameOverride id. Metadata annotations expose the alias without retaining a conflicting old key; JSON storage keeps the existing numeric id format. The renderer accepts this alias while preserving other marketing-page consumers. Recursive schema coverage recognizes stored nameOverride keys. Native numeric options were rejected by Tina’s schema validator; the custom labeled select emits numbers and displays company names.

Chrome local acceptance: collection opens the correct page; all nine company labels appear; Cachengo is selected in the picker. A contributor heading edit→Save changed only that heading and preserved every numeric id reference; preview showed the saved heading. Reopening the nested form and saving the original heading restored all values. Original formatting restored after semantic equality; no test content remains. Local backend/server stopped. Ten tests pass, including alias-render parity, selection ordering, unknown/duplicate ID rejection and full stored-field coverage. Typecheck151files clean. Hosted Git roundtrip, media upload, repeated quotation add/remove/reorder/reset and live company lookup remain unverified.

AI final local verification: after stopping local editing, regenerated hosted admin, then built Astro sequentially. Fresh4421 preview passes212editorial routes/key routes/unknown404. The242route metadata audit reports191blank descriptions remaining, with AI status200 and no metadata issues. Normal deployment CI retains TinaCloud schema checks; local skip-cloud-checks was only for preparing the additive unpublished schema.

AI contributor validation follow-up: renderer rejection alone was insufficient. A parent-list ui.validate passed unit tests but a nested Company selection could still be saved in the local browser. The temporary duplicate was immediately restored from committed JSON; no invalid data was pushed. Added the same validation to the active numeric company field and displayed its error beside the select. Retest selecting OKESTRO in the Cachengo entry showed the named duplicate alert and disabled Save; Git content remained unchanged. Moving to the top-level form restored saved selections and disabled Reset, so unsaved draft retention across that transition is not certified. The test proves the active-field save block, not all navigation paths or hosted enforcement. Source-level validator tests also cover missing/unknown entries and both stored/editor ID names.

A collection-level beforeSubmit check now additionally validates the full contributor list before Tina invokes its save operation, independent of mounted field validators. Source inspection of installed Tina3.13 confirms the hook runs before onSubmit and before editorial-workflow payload submission. Unit acceptance rejects duplicate submissions and returns valid values unchanged. This complements the Chrome-verified active-field error/disabled Save; the collection hook itself has not been deliberately bypass-tested through the hosted UI.

An empty contributor list is permitted; the renderer now handles Tina omitting that optional list by showing no contributors. This is model-tested, not a completed remove-all UI test. Final normal hosted Tina+Astro build passed with cloud checks enabled; an additional Astro build verified this empty-list adjustment.

### VMware migration dedicated landing editor

The dedicated VMware collection covers the hero/buttons, quotations, planning banner, feature comparison and source attribution, case-study cards, guide/survey percentages, white paper promotion, UI labels, contributor selections and published metadata. Source: marketing-site dc9f57b5bd5dc4c99ade19e065fbff354651ef6f, CMS pagesCollection/vmwareMigrationToOpenstackPage/index.js. These are editorial fields in the Gatsby source; its company picker calls the Summit public companies API.

The company control now has separate reviewed snapshots: nine AI contributors and27VMware members. Existing numeric id storage uses the same alias mechanism. Live company search/freshness remains pending. Collection beforeSubmit guards percentages0–100, comparison-column values, unknown or duplicate contributors. The shared AI list validator is wrapped to prevent Tina's allValues callback argument from being mistaken for the reviewed snapshot argument. Fifteen tests pass, with recursive stored-field coverage, alias/render equivalence, feature ordering and invalid submission checks. Typecheck158files clean.

Moved the entire existing VMware markup and styles into its Tina page component; an exact source comparison verified no changes to that markup/style block. The public route and visual editor use the same component. A new description uses existing page topics. Chrome local backend acceptance: correct collection/sections/native preview; nested comparison feature title edit→Save changed exactly one value and preserved all numeric company IDs. Restoring the title→Save restored all original values. Original formatting restored after semantic equality; no test copy remains. Development servers stopped after testing.

Open acceptance: actual metric-validation interaction, repeated-item add/remove/reorder/reset, media upload, mobile/editor visual checks, live company search and hosted Git roundtrip. The imported editorial count remains170/212; this dedicated landing is outside that cohort. No service entities or production data were modified.

VMware final built verification: hosted-format Tina build then Astro build passed sequentially. Fresh4424 route audit passes212editorial routes plus key routes/React/unknown404. The242route SEO audit reports190blank descriptions remaining, down from191. This verifies rendered metadata and route behavior, not hosted editor actions or editorial freshness.

### Shared footer preflight

The header/footer are dedicated shared content, outside the imported editorial-page count. Neither has a full Tina editor yet. Footer source at gatsby-theme-marketing-oif-core5eccf003fb1d2d14e711b6f054b8a4b0b4b58e23 renders display-controlled social groups, configured link attributes and modal assets. Astro had ignored social.display, skipped the WeChat modal and dropped Mastodon rel=me. These behavior gaps are fixed before exposing their fields. credit.display is now honored as well. Existing stored values remain unchanged.

The existing marketing-site WeChat QR JPEG is copied unchanged to public/images/footer as a fixed UI asset. Native dialog supports close/Escape/backdrop and restores focus; a custom element owns and aborts its event listener on disconnect. Chrome at local4425 Use Cases verifies button→dialog, loaded1280px source, Close→focus return, reopen→Escape→focus return, and Mastodon rel=me. Screenshot reviewed. Typecheck158files/build/212route regression checks pass. No WeChat sign-in, scan or outbound messaging occurred.

Still open: global footer/header Tina schemas/previews/save roundtrips, social icon parity, generalized CMS-selected modal media paths, and mobile/hosted checks. Current content retains rendering/icon fields not yet implemented by Astro; do not advertise those as working editor controls. Source theme places credit inside social; Astro preserves its existing independent credit location and uses the stored display flag explicitly.

### Shared footer editor — September 13

The `Global — footer and newsletter` collection now covers newsletter display/copy, repeatable link columns, social destinations and QR images, display flags, and credits. `/cms-preview/footer/` selects the shared footer form; all site layouts consume the same document and preview island. Software catalogue data remains owned by its service, with the development-admin link in its separate editor.

Four legacy image filenames were normalized to `/images/footer/` URLs so the image widgets can preview them. Existing bare filenames remain supported. File-based social icons render; legacy icon identifiers are preserved but hidden in the form pending a full icon treatment. Link attributes are restricted to rel, target, title and aria-label. Collection submission validates links and media even when nested field forms are unmounted.

Local Chrome acceptance: newsletter heading saved, appeared on a separate Use Cases page, and all other stored values remained identical. Original heading restored through Tina and verified against the original document. Footer screenshot inspected. A hidden announcement query initially selected the wrong form; the header now registers that query only when the announcement is displayed. Hosted Git round-trip, nested add/remove/reorder and mobile editor/media-upload acceptance remain open.

### Shared navigation editor — September 13

`Global — navigation` edits the shared labels, destinations, display flags and dropdown entries. Gatsby theme source at 5eccf003 defines this editorial model and uses blank rows as dividers; Astro now renders those dividers. Third-level legacy entries and requiresAuth flags are preserved but hidden from editing: nested submenus and shared identity remain unfinished. Links requiring authentication are withheld in this anonymous preview; that is presentation, not authorization.

The header's native menus and search are extracted into SiteNavigation. A custom element attaches and cleans up menu listeners when Tina replaces the island. Dedicated global previews suppress registration of the other global form so SSR's first query opens the intended editor; normal page previews retain their content editor.

Local Chrome: changed Software > Overview label, saved, verified every other stored value unchanged including third-level fields, confirmed separate Use Cases page received it, restored via Tina, and verified original JSON. Full repeat-item reorder/add/remove, mobile and hover/keyboard regression acceptance still pending. An Events mouse click ended with its details closed, which may reflect desktop hover opening before the click; no successful menu-interaction claim from that check. No production or service data changed.

Footer deployment 2d9c6ee failed the normal TinaCloud schema gate (FooterNewsletter missing remotely), including one retry. Validation passed. Do not bypass cloud checks; recheck indexing with the next schema push.

Built-preview keyboard follow-up passed: Events summary Enter opens its menu; Escape closes it and returns focus to Events. Header desktop screenshot reviewed. Final typecheck clean across171files,19tests pass, sequential hosted-format Tina/Astro builds pass, and212route/keyReact/unknown404 audit passes. Hosted schema deployment remains separately gated.

### Shared application authentication preflight — September 13

CMS GitHub login and visitor OpenInfraID login are separate systems. Astro's copied src/lib/auth helpers are currently unreferenced by routes/components. They still hardcode beta.openstack.org callback/logout/origin checks; this is not an active Astro session. SiteNavigation explicitly links to the pending-authentication notice. SoftwareApp currently renders a read-only catalogue without importing the auth coordinator. A shared header alone does not prove app/API authentication parity.

Before activation, confirm the intended public client and register Astro callback/logout URLs. Then configure the Astro origin, port login/callback/signout/logout UI, connect header identity state, and pass the same framework-neutral session interface to authenticated app features. Keep issuer/client/audience aligned with the destination API; do not assume a catalogue development API accepts production tokens. Acceptance must include cross-page reload, cross-tab refresh/logout, expiry recovery, callback errors and authorized/unauthorized service calls. Legacy SilverStripe session bridging is not part of the standalone target.

Three new offline tests verify the existing coordinator: two consumers share a single refresh under the common lock, logout during refresh cannot restore a stale session, and invalid_grant clears credentials while transient errors retain retry state. These use synthetic tokens and do not certify the provider registration, browser locks/storage, live PKCE or API integration. Public client/origin confirmation requested; login remains explicitly pending until configured and tested.


### Footer repeated-link acceptance (September 13)

Chrome local-mode editing verified adding a named destination, saving it to the footer JSON, observing it on a separate Use Cases page, then deleting/saving it and verifying removal. All other content remained semantically identical, and the original footer file was restored exactly. An incomplete draft showed Required on both fields and disabled Save; Reset was confirmed without publishing the draft. This UI check used Tina required fields; the final implementation uses field-level validators to retain the existing nullable GraphQL types, plus whole-form beforeSubmit validation so leaving a nested field does not bypass it. The final validator wiring still needs a browser recheck.

Rendering permits unfinished draft links while publishing requires both trimmed link text and a destination. Existing URL/media/attribute checks remain. All 26 local tests passed. Reordering, mobile/editor layout and hosted Git save/deploy acceptance remain open. The initial normal build stopped at the TinaCloud schema synchronization gate; local compilation and subsequent CI results must be checked separately. No production data or service records were changed.

Local hosted-editor compilation with the cloud check skipped, followed sequentially by the full Astro build, succeeded. This is local compilation evidence; the publishing workflow retains its normal cloud schema gate.


Footer deployment follow-up: e6d020e Publish34791454318 failed before deployment because spreading the TinaField union into a field with ui.validate caused four TypeScript errors. Replaced those two definitions with explicit string fields and typed validators. The full Astro check now reports0 errors/warnings/hints across174 files; all26 tests and sequential hosted-editor/local Astro compilation pass. Final publishing result still needs confirmation. No runtime deployment resulted from the failed job.
