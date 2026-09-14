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


Schema reconciliation: Publish34791625719 failed at the cloud gate, while Validate34791625711 passed. Inspection found committed tina-lock.json still declared the two link fields required while config.ts’s imported footer schema had been changed to nullable fields. Restore required:true in the explicit string fields, retain whitespace validators and complete-form validation, and commit the regenerated lock alongside the schema. This aligns authoring requirements and the generated contract instead of bypassing the hosted gate. Astro check passed174 files. Final Chrome recheck remained inconclusive: a Vite dependency-cache500 was resolved by stopping/restarting the owned dev server (route then returned200), but the editor iframe did not repopulate. No content save occurred in that attempt; the previously verified add/save/remove and incomplete-field UI observations remain valid only for their recorded builds. Local dev and Tina processes were stopped afterward.

Added a regression check comparing the actual imported footer TypeScript schema against the committed Tina lock’s recursive field types, list flags and required flags; it catches the mismatch responsible for the failed deployment. It also verifies the current stored footer satisfies complete submission validation. Four footer tests pass, local hosted editor20717 and sequential Astro52960 builds pass. Publishing result pending the aligned commit.


## Archived FAQ editorial workflow — September 14

Eleven existing FAQ page records are now in the Editorial pages collection. The nested FAQ panel exposes topic title/anchor/order, question/answer lists, empty-state copy and contact information. The current Shanghai archive has12 published questions in3 topics; the other10 records preserve their empty topic lists. No hidden database questions or ExtendedAnswer text were imported. Source ownership/hidden-record decision remains documented in the vault feature assessment.

The generic page body is now optional because FAQ content lives in the structured fields; null body/list values from Tina render as empty values. Draft-only fallback headings/anchors keep an unfinished item previewable; complete-form validation rejects missing question/answer/contact text and invalid/duplicate anchors before publishing. Answers use the existing HTML sanitizer, and the existing delegated archive-faq custom element handles refreshed markup. The display-only contact dialog does not submit anything.

Chrome local4441: created a temporary question through Topics → Questions, filled question/answer, saved, verified the JSON changed only by that addition, and searched it successfully in both a separate page and the refreshed Tina iframe. The separate page contact dialog opened with the original contact information. Deleted the temporary item and saved through Tina, verified the original12 questions and all other JSON values restored, then restored exact file formatting. Reloaded page had no test heading. An initial save attempt exposed the inherited required-body bug; corrected before the successful cycle. Empty new-question fields show Required and disable Save while editing them. Reorder/reset/mobile/hosted FAQ save roundtrip are not yet certified.

Coverage is now181 of212 imported editorial records,31 excluded and0 included records with unsupported fields. Dedicated global/landing collections are additional. Source/coverage tests preserve all stored FAQ fields;30 tests pass. New schema requires TinaCloud indexing on push, and publishing retains its normal schema gate.

Final validation: Astrocheck reports0 errors/warnings/hints across177 files; local hosted-editor compilation24232 followed by Astro64085 succeeded. Fresh built preview4442 replaced4440; route audit44089 passed all212 native editorial records, key server-rendered React routes and unknown-route404. Added a fourth FAQ regression test comparing the actual schema against the committed lock, including optional body; it passes. Publishing uses the normal cloud gate after the schema push. Source content files are unchanged after local test cleanup.

### FAQ question ordering and reset — September 14

The built-in sortable control did not change the order in Chrome using its advertised keyboard sequence or a pointer drag; that is an unsuccessful automation observation, not proof that manual dragging never works. Added a custom inline Questions field with labelled Up/Down/Remove buttons and expandable question/answer fields. It uses Tina’s current input value directly so Reset does not retain a removed nested-item path. Topic-level sorting remains the built-in control and is still unverified.

Chrome local4443 verified moving question1 down, saving, and comparing the file: exactly the first two questions exchanged positions. Moved question2 up and saved to restore the original sequence. Added an empty question: inline validation showed the missing-text error and disabled Save. Confirmed Reset removed that draft and returned five original General Information questions with Save disabled, without a missing-item error. Restored exact original file bytes afterward. No test edits remain. Question reorder/save and added-question Reset now have local acceptance evidence; topic ordering, mobile layout and hosted save remain open.

Previous FAQ release e4ccd1f publishing34794396930 and validation34794396927 both succeeded. This custom-control release requires its own deployment check.

Final control validation: Astro check178 files0 errors/warnings/hints, all31 tests pass, and normal TinaCloud/full build99084 succeeds without skipping the cloud gate. No content records or generated schema contract changed; this is an editor UI change.

### FAQ visitor mobile acceptance — September 14

Fresh built preview4444 (replacing4442) served the final question-control build. Chrome viewport390×844: all12 Shanghai questions rendered, document scroll width375 did not exceed viewport390. Searching a nonmatching phrase produced “No results were found.” Clicking Registration cleared the query, restored all12 questions and moved #registration to approximately20px below the viewport top. Contact Us opened a readable dialog contained within the phone viewport. Escape closed it and returned focus to Contact Us. Screenshot visually checked the dialog, text wrapping and controls; temporary viewport override was reset. This verifies the public FAQ visitor layout and these interactions at one mobile size, not the Tina editor’s mobile layout or every FAQ’s content.

### FAQ topic ordering and nested editing — September 14

Added a controlled Topics field with explicit Up/Down/Remove controls, expandable title/anchor inputs and the existing inline Questions editor. The schema/data contract is unchanged. Local Chrome4445 verified swapping the first two complete topics and saving; semantic comparison proved all questions/answers moved with their topic and no other values changed. Restored original order with Up/save. Added a temporary fourth topic and question, saved exactly that addition, then removed the topic with its question and saved. A duplicate general-information anchor disabled Save. Reset removed an incomplete newly added topic without a stale editor path. All original content and exact file formatting were restored.

At390×844 the editor shell showed horizontal scrolling (document scrollWidth440 versus viewport390), although the visible form fit the screen. This is an open Tina mobile-shell issue; full CMS mobile acceptance is not complete. The viewport override was reset. Public FAQ visitor mobile acceptance above is a separate, passing check. Hosted CMS save is still unverified.

Topic-control checks: Astrocheck179 files0 errors/warnings/hints, all31 tests pass, and normal TinaCloud/full build95398 succeeds. No content files or generated schema changed. Prior docs release79ba3e4 publishing34795155324 succeeded.

### Narrow-screen admin shell correction (local verification)

Tina 3.13 keeps its desktop body padding when resized below its 440px minimum preview width: the attempted negative padding is rejected by the browser. Chrome measured a 390px viewport with 440px body padding and horizontal overflow. The sidebar also has a 360px inline minimum that clips its controls on 320px screens.

`tina/admin-styles.ts`, installed once through `cmsCallback`, makes the panel an overlay at 440px and below, releases its minimum width, and removes the inert off-panel toggle from layout. This affects the admin shell only. A direct CSS import emitted a generated file but did not apply in the local editor, so it is not used. Chrome confirmed the installed styles and a 312px sidebar in a 320px viewport, with the panel toggle and Save controls visible. No content was changed.

September 13 follow-up: Chrome verified desktop (1448px) → 390px → 320px → desktop. Document width matched each viewport, phone body padding was zero, and hiding/reopening the panel worked at both phone sizes. Screenshots confirmed the compact Save/panel controls and the collapsed visitor preview. The viewport override was reset. Hosted admin verification remains pending.

### Homepage release selector browser acceptance

Chrome with the isolated local Tina backend loaded all seven published announcements and retained Gazpacho without rewriting its stored URL. Selecting Flamingo and saving changed only the destination (plus JSON formatting); `/latest-release/` returned 307 to Flamingo. Saving Gazpacho restored the original selection, and the original homepage bytes were restored after verification. Refresh retained the selection, and changing then confirming Reset returned to Gazpacho. A misleading unavailable-selection placeholder was corrected and verified in Chrome; the empty placeholder is disabled. These checks do not establish hosted publishing or new-announcement creation acceptance.

### Software — Get Started editorial port

`/software/start/` now has a primary Tina island and a dedicated **Software — Get Started** collection. The Gatsby source already treated this as Git-owned editorial content (`marketing-site` dc9f57b5bd5dc4c99ade19e065fbff354651ef6f, `src/@openstack_dev/gatsby-theme-marketing-oif-core/cms/config/collections/pagesCollection/softwarePage/softwareStartPage/index.js`). This is not a Software API catalogue port.

The collection covers every existing field recursively: browser/page headings, Try/Learn/Next Steps cards, logos/actions, and Deploy summaries, distributions, how-to links, companies, downloads and tools. It adds an editable search/sharing description. Cards use their heading as their editor label. Optional lists can be cleared; incomplete drafts render; submitted empty headings and unsafe destinations are rejected. The existing HTML-forward page moved into a shared Astro component used for both public rendering and Tina preview.

Local Chrome loaded the collection and its Try card. A temporary heading edit saved to the local JSON and appeared in the preview; deep comparison proved only that heading changed. Existing main text and all link destinations matched the previous built page before the edit. Chrome became intermittent during restoration; the original file was restored directly after a deep comparison, retaining only the intended description addition. No test content or service data was published.

53 tests and final Astrocheck201files0/0/0 pass (an initial implicit-any diagnostic was corrected). Full schema round-trip coverage, cleared-list drafts and unsafe-link validation have tests. Browser card/action add/remove/reorder/reset, final list labels, mobile, R2 media and hosted publishing remain acceptance gaps. Community is still outside Tina; its page currently asks for a nonexistent top-level description despite having nested banner copy. That remains a separate content/metadata task involving service-owned project/member references.

Get Started preview also neutralizes unsafe draft action/resource URLs and logo sources before rendering, while preserving raw editor values for correction. The submit guard rejects those destinations. Local Tina compilation and full Astro build passed; the final publishing job must pass normal TinaCloud schema indexing after this new collection is pushed. No publish gate is bypassed.


### September 14 — CMS endpoint error guidance

The shared response parser for our R2 media adapter and published-release selector now handles HTML sign-in/error pages, JSON authorization failures and malformed JSON explicitly. The release field displays that guidance instead of replacing every failure with a deployment message. No automatic retry or replay of uploads/saves is introduced. Valid API error messages (for example upload size limits) remain visible.

55 tests pass, including HTML200/403/502, JSON401, upload-size error and malformed JSON cases; Astro check is clean across203 files. Hosted Chrome currently reaches Cloudflare Access, so the reported Tina content-fetch failure has not been reproduced or diagnosed. This change hardens our custom endpoints; it does not change TinaCloud GraphQL or claim to fix that reported failure. Hosted expired-session/media acceptance remains pending.


September14 hosted follow-up after JP refreshed Chrome sign-in: `/admin/` loaded Homepage fields and the live iframe without the reported fetch error. Release promotion loaded all7 published announcements with Gazpacho selected; the Release image picker opened the Media Manager and populated its image/PDF list. No content was changed, selected, uploaded or saved. This verifies current authenticated content/choice/media-list reads, not the original failure cause or upload/publish roundtrip.


### September14 — hosted media search and unsaved insertion acceptance

Chrome on authenticated astro.openstack.org: searched Media Manager for Icehouse2 and received exactly its existing registry image. Its thumbnail completed at524×164 natural pixels. Insert placed `/assets/marketing/Icehouse2.png` into the unsaved homepage release image and live iframe (one matching image). Confirming Reset restored `/images/gazpacho-sm.png`, removed the test image from the preview and disabled Save/Reset. No Save, upload or deletion occurred; no Git/service data was modified. This establishes hosted search, asset delivery, unsaved selection/preview and reset for one existing image. New upload and hosted save/deploy roundtrip remain separate.

Source-reviewed capacity gap: src/pages/api/cms/media.ts fetches only one R2 list page (`limit:1000`) under uploadPrefix, without following its cursor. Uploaded assets beyond that page would be omitted from search/listing. Existing historical registry entries are merged separately. Production readiness requires complete pagination/search design and acceptance beyond1000 uploads; current verification must not be interpreted as unlimited-library support.


### September14 — remove single-page R2 upload truncation

The media endpoint now follows R2 cursors while filtering uploaded objects, stops after the requested60 results plus one lookahead match, then includes approved historical registry entries when uploads are exhausted. Memory retains only the requested result page rather than accumulating every object. It follows `truncated` even for short pages and rejects a missing/repeated cursor instead of silently reporting partial success. The endpoint retains its existing auth and upload controls. Reference: [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

Tests use2001 synthetic upload metadata entries (no real uploads) to verify a match beyond two R2 pages, case-insensitive search, registry inclusion, short-page offset boundaries, extension filtering, early stopping and storage/cursor failures. Four media tests pass; final Astrocheck is clean205files; normal TinaCloud/full build passed. Hosted post-deploy regression and high-volume latency remain pending. Sparse searches still scan the prefix, and numeric pagination is not a snapshot across concurrent uploads; a persistent media search index remains a possible future performance improvement. This fixes silent first1000 truncation, not unlimited-scale performance.


### September14 — blocking Get Started draft-navigation defect

Hosted Chrome reproduced twice: open Software — Get Started → Try OpenStack, add a card, open New item, fill its required heading. The heading appears once in the live iframe and Save becomes enabled. Clicking the Try OpenStack breadcrumb then removes the unsaved card, restores the original two cards and disables Save/Reset; the test heading also disappears from the iframe. Neither run clicked Save or Reset. No test content was published. This is a CMS acceptance defect; repeated-card workflow is not ready.

Separate observation: opening the empty new card shows Required and disables Save. Keyboard Enter activates the section and Add button, but did not open the role-button card row; clicking did. Browser click automation intermittently reported Detached, but read-only inspection and a keyboard retry recovered. Do not conflate that automation issue with the twice-reproduced draft loss.

Initial source trace: Tina3.13 FormBreadcrumbs dispatches forms:set-active-field-name; its reducer preserves the existing tinaForm instance. No explicit reset occurs in that reducer. Investigate form reinitialization/lifecycle and Astro bridge synchronization next; no root cause established and no dependency patch applied. New unsaved drafts were discarded by the observed defect, leaving the original page in the editor.


### September14 — draft-loss root cause and guarded dependency patch

A React-only test reproduces the hosted draft loss with installed react-final-form7.0.1: edit a list, unmount its Field while viewing a nested card, remount the list Field, and the original list overwrites the draft. The library's useField registration effect calls form.change with saved initialValues whenever getFieldState is absent. Unregistered fields can still retain unsaved values, so absence of field registration does not mean absence of a draft. This reproduces without Astro or TinaCloud.

`scripts/patch-react-final-form.mjs` removes that forced rewrite in both CJS and ESM builds, allowing Final Form's existing registration logic to initialize fields. The patch is version-guarded to7.0.1, idempotent, and applied on postinstall and before every normal build. A dependency upgrade must explicitly review/remove the patch. No saved content or validation policy changes. react-test-renderer18.3.1 adds regression coverage for the actual mounted library: added card and cleared list survive remount; Reset restores the saved list. Test failed before patch and passes afterward. All59tests, Astrocheck207files and normal TinaCloud/full build pass. Hosted browser confirmation still pending deployment; do not mark the defect fully accepted yet.


September14 hosted patch acceptance: Publish34832012068 succeeded for9be0425. Fresh Chrome editor repeated the previously failing SoftwareStart workflow: added card, entered temporary heading, confirmed iframe heading, returned to Try OpenStack and the third card remained with Save enabled. Reopening retained its heading. Confirmed Reset removed test heading from iframe and restored the original two cards with Save/Reset disabled. No Save/upload/service mutation occurred. This closes the specific unsaved-card remount loss reproduction. Added regression coverage verifies nested undefined text clears, false values, declared field defaults and Reset as well as list changes; both mounted-library tests pass.

Remaining usability gap: resetting while inside a newly added card leaves its empty nested editor visible with Required until navigating back to the list; the discarded item does not remain in content. Reorder, save roundtrip, mobile and other nested-field regressions remain separate acceptance work.


September14 local SoftwareStart save roundtrip: Chrome explicitly confirmed local filesystem mode at4467. Added a Try OpenStack card, filled its heading and saved. The JSON gained exactly one `{title: ...}` card; a deep comparison proved all other data identical. The saved heading appeared in the iframe. Removed the card using Tina's delete control and saved again; deep comparison matched the original content, then original file bytes were restored. No test content remains. A Space/ArrowUp/Space attempt did not change order and Save remained disabled, so keyboard reorder is unverified. Stopped owned local Tina and Astro processes; regenerate hosted admin before any publish. This adds local card create/save/remove/save acceptance, not hosted Git publishing, reordering or mobile certification.


### September14 — keyboard list reorder correction

Tina3.13 source placed useSortable attributes/tabIndex on ItemHeader but keyboard listeners and activator reference on a separate unfocusable DragHandle. The guarded `scripts/patch-tina-list-keyboard.mjs` moves the attributes to that handle and names it “Reorder list item”. ItemClickTarget now has button semantics and Enter/Space activation. Installed through postinstall and normal build with exact-version/source-shape checks; review on any Tina upgrade. Stored schema/data remain unchanged.

Chrome local4468 confirmed Space picks up the second Try card, ArrowUp moves it, Space drops it above the first, and Save changes only those two positions in JSON. Repeating the operation and saving restores the exact original data; original formatting was restored afterward. Enter opens the named card editor, including nested actions. All60tests and normal build passed before browser QA. Owned local Tina/Astro were stopped and hosted assets rebuilt afterward. Hosted confirmation, pointer-drag regression and mobile remain pending. The patch applies to Tina sortable lists broadly, so shared list consumers remain in the acceptance scope.


September14 responsive and hosted keyboard follow-up: fresh built preview4469 route audit passes212 editorial routes plus key SSR React routes and unknown404. Chrome390px GetStarted public page fits (no horizontal overflow), headings and first card visually reviewed. Hosted SoftwareStart form and nested card settle at390px scroll width; screenshot reviewed with navigation and Save visible. Initial loading briefly reported unrecognized fields/overflow, which resolved without edits; stable-state checks do not certify absence of loading flicker. Viewport reset afterward.

Publish34834777952 succeeded for9575551. Reloaded hosted editor exposes two named reorder handles. Space/ArrowUp/Space moves second Try card above first; confirmed Reset restores original order and disables Save. No hosted Save. This verifies deployed keyboard reordering for that list. Pointer/touch dragging and other list types remain separate checks.

## September 14 — Hosted media search/filter regression

After the R2 cursor-listing change was deployed, a fresh signed-in Chrome session opened Media Manager successfully. Searching `Icehouse2` returned the existing PNG; searching `OS14ParisMapLevel02` returned the existing PDF. Selecting Images with that PDF query produced the explicit no-matches state; selecting Documents restored the PDF. Homepage Save remained disabled. No media upload, deletion or content save occurred.

This verifies hosted library reads and type/search integration after the listing change. The synthetic multi-page tests remain the evidence for traversal past 1,000 uploaded objects; this browser check does not establish that the deployed upload prefix contains that many objects or certify sparse-query latency, concurrent pagination, or upload/save/deploy round trips.

### September 14 — hosted text save, Git publish and restoration verified

Used only the dedicated `/cms-proof/` collection on the protected Astro site. Before editing, remote Git contents matched local bytes. Through hosted Tina, changed its headline from `OpenStack — Tina and R2 editing proof` to `OpenStack — temporary publishing verification` and saved once. Git commit `7d8debfff9e6bc8243dfcb115767aae0315a8554` changed exactly that JSON field; the live Tina iframe displayed it. Publish34842208589 and Validate34842208586 succeeded. Independently loading `/cms-proof/` in a separate Chrome tab showed the temporary heading, so this was a deployed-site check rather than only Tina's live preview. The publish run lasted approximately2m9s; this is one observation, not a latency guarantee.

Restored the original headline through Tina and saved once. Restore commit `ce320d855e4f78191261ec8672a576cca2d09afd` returned the file byte-for-byte to its original baseline. Publish34842458110 succeeded. A fresh independent navigation found exactly one original heading and zero temporary headings. Local main was fast-forwarded to include both CMS commits; net content diff is zero. No homepage, service, or production data changed.

This closes hosted **text-edit/save/Git/deploy/restoration** acceptance for the proof collection. It does not close new R2 upload-to-CMS-save roundtrip, release creation/publishing, concurrent-editor conflict behavior, or all collection-specific repeated-list/mobile workflows. Intermittent Chrome automation clicks timed out before the edit; state was re-observed before retrying, and no Save was blindly repeated.


September14 upload acceptance attempt: hosted Tina signed in successfully; navigated explicitly to CMS proof collection and opened the Hero image picker. Before editing, remote Git proof JSON matched local bytes (private baseline saved locally). Prepared a copy of the already-public OpenStack homepage diagram PNG. Browser filechooser interception timed out when clicking Upload, before setFiles ran. No upload, selection or CMS Save occurred. Chrome upload troubleshooting directs the user to enable Allow access to file URLs for the ChatGPT extension. This is a browser automation handoff failure, not demonstrated CMS/R2 failure. Keep new-upload/save/publish acceptance open and retry only after the setting is ready.

### Use Cases editorial collection — September 14

Added `Use Cases — page content` for the existing `use-cases.json` singleton: metadata, heading, HTML/Markdown introduction, hero/media, YouTube ID, browse modes, all interface labels and survey text/link. The form explains that catalogue records remain outside this editorial collection. No source story data was moved or changed. Schema coverage checks every stored field; submission validation requires safe media/destinations, a valid video ID, nonempty UI labels and exactly one of each of the five supported browse modes.

The existing Astro page markup and CSS now live in a Tina island component. A custom element initializes gallery controls on each preview replacement and aborts listeners on removal, including its global hash listener. Normal page views still render committed JSON. Search/sharing metadata takes effect after publishing; head tags are not part of the live body-island preview.

Local Chrome acceptance: temporary heading saved to disk, all other fields compared identical; heading appeared in the live preview, and Workday filtering still returned one story after replacement. Heading restored through Tina. Nested Recent label changed to Newest stories, saved and appeared in preview, then restored; original content document restored byte-for-byte. Mobile filtering returned one card without horizontal overflow. Screenshot of the form and filtered preview reviewed. Local R2 fallback images do not certify hosted media loading. New upload acceptance remains separately pending Chrome file access setting.

Initial normal hosted build correctly stopped on the additive schema mismatch (UseCasesViews not yet indexed). Local Tina dev plus standalone Astro build passed; 74 tests and Astro check (221 files, zero diagnostics) passed, including additional schema coverage verification after local schema generation. Local Tina and Wrangler stopped. Next gate: push/index schema, normal hosted build, then hosted editor acceptance. No local-mode editor assets may be deployed.

Use Cases follow-up acceptance: f4d30c5 pushed and TinaCloud indexed the additive collection. Normal `scripts/build.mjs` passed with cloud checks enabled; all74 tests passed. Publish34850919176 completed successfully. Hosted Chrome opened the collection with its fields and ownership notice; an unsaved heading edit appeared in the preview. After the preview settled, Workday search returned `1 story`. Reset confirmation discarded the draft: original heading present, temporary heading absent, Save disabled. No hosted Save occurred. The initial search attempt during preview replacement timed out and its input was cleared; settled search succeeded. Preserve that distinction rather than certifying interaction during an in-flight preview replacement. Hosted save→Git→deploy acceptance for this collection remains open, along with full nested-mode reorder/error-state and media-upload browser acceptance.

A fresh audit of the normal hosted-mode local build inspected249 routes without failure and retained91 missing descriptions/OG descriptions. Preview4492 is the current normal build; local Tina/4390 Wrangler were stopped before regeneration.

### Hosted Use Cases publishing round trip — September 14

The hosted editor saved a temporary heading in commit `f441bf78ad86e547e83013a1a6911f1e1d74a49e`. Parsed Git content differed only in that intended heading. Publish34851766047 completed successfully, and a separate Chrome tab on `/use-cases/` displayed the temporary heading, proving the result outside the editor preview.

The original heading was then restored through Tina in `e4e40b07b26e675e3b7f653c0039367270e3cb46`. Every parsed field and nested value matches the original baseline. Tina serializes keys in schema order and omits the final newline, so this is semantic equality rather than byte identity. The existing story catalogue was unchanged. The local checkout was fast-forwarded to include both authorized CMS commits.

Restore Publish34852022833 completed successfully. Independent Chrome reload showed the original heading and no temporary publishing-verification text. This closes the hosted Use Cases text save→Git→deployment→restore acceptance check. It does not certify new media uploads, all browse-mode editing permutations, concurrent editing or service catalogue administration.

Summit Highlights registration (September 14): four existing archive records added to Editorial pages, raising source coverage to186/213 (27 excluded). Every nested Highlights field is represented in the generated lock. Shared pure validation is used by save and server preparation; it does not import server route inventories into the editor bundle. The same Highlights renderer serves the preview. Local Tina generation and standalone build passed; seven relevant schema/preparation tests passed. Chrome opened the Editorial collection and selected Boston, but its visual preview then hit CDP timeouts. No field was edited or saved; Boston remained byte-identical to the pre-test baseline. Both local Tina and Wrangler processes were stopped. CRUD/reorder/remount and hosted publish acceptance remain open; registration is not proof of editor parity.

September14 local Highlights API round-trip: after Chrome page interaction again timed out, the local Tina GraphQL endpoint successfully queried Boston and saved its complete document with statistics reordered plus one temporary statistic. Filesystem deep comparison proved every other field unchanged. A second mutation restored the original document; semantic equality was verified and original byte formatting restored. No test data remains. This is local API serialization/save evidence only: beforeSubmit browser validation, visual preview, drag reordering and hosted publication remain unverified. Script used fixed localhost4001 and an explicit finally restoration; no production CMS writes occurred. JP offered to restart Chrome and was asked to restart/open the extension/sign into Astro before a browser retry.

September14 Chrome restart restored interaction (new browser connection). Local Boston Highlights: opened nested fields, changed introduction heading; after a transient preview/CDP timeout, settled iframe showed the edited heading. Save changed exactly that value; restoring through the UI/save returned every field to baseline. Mouse drag swapped the first two statistics; preview and saved JSON matched and all other fields were preserved. Keyboard Enter/Space/ArrowDown attempts did not move the item. Reverse mouse drag did not make Save active; original order was restored through the local Tina API and full semantic/byte equality verified. No test content remains. These observations establish heading save/restore and one directional drag/save, not complete reorder accessibility/reliability. Local development servers stopped afterward; hosted-mode rebuild required before further deployable previews. Browser timeouts during iframe refresh can recover with a settled re-observation and are not by themselves proof of a CMS request failure.

### September 14: explicit Summit statistics controls

The Summit highlights published-statistics field now has inline label/value inputs and Up, Down, Add and Remove buttons. This replaces the drag-only interaction for this field; other repeatable fields retain their existing controls. Historical values remain Git-owned editorial content, not computed Summit API totals.

Chrome/local Tina acceptance on Boston: Enter on Down saved the first two statistics swapped; Enter on Up saved the original order. Adding a fifth label/value and saving preserved every other field; removing it and saving restored the complete baseline. All original content values and file formatting were verified restored. No test content was published. Astro check: 235 files, zero errors/warnings, one existing hint. Full suite: 85 passing tests. Hosted CMS acceptance and Highlights photo/keynote/media workflows remain separate checks.

September 14 Highlights media source check: the supplied full SilverStripe database has four published Highlights records, all with StatisticsVideoID=0. Their eleven selected YouTube IDs match the imported records; Barcelona's stored embed URL is normalized to its ID. Four StatisticsVideoPoster filenames match the imported statistics background aliases. Source 2172298743fe807a92758cf307059b69a7dba668 declares an MP4 upload field, but its template emits an empty video element without a playback source, and the targeted Summit JS/template search found no bgvid source assignment. No populated MP4 content needs recovery from this snapshot. Future MP4 authoring is not implemented or certified. This evidence does not replace keynote/photo/media editor acceptance or a fresh production-data comparison.

September 14 Barcelona local Chrome checks: changed the existing keynote title and saved; preview heading matched and whole-document comparison proved that only the title changed. Restored through the UI/save. Changed the first photo description and saved; its preview image link accessible name matched and whole-document comparison proved that only that description changed. Restored through the UI/save; all original values and byte formatting verified. Added a temporary second keynote in the unsaved draft and observed its preview selection respond; subsequent preview refresh/Save attempts encountered CDP timeouts, so add/save/remove and remount reliability are not certified. Filesystem remained at the original single keynote. No test data was published. Default Tina add/delete list buttons lack accessible names; this remains an editor accessibility finding. Local CMS/Worker stopped before normal hosted-mode rebuild.

September 14 list action accessibility: expanded the pinned Tina 3.13 patch to label Add actions and name Remove actions using the field label plus one-based item number. ItemDeleteButton now passes its minimum-length disabled state to the native button, rather than only styling away pointer events. Exact source-shape guards fail on dependency drift. A rendered-component test verifies the accessible name and disabled/enabled states using the installed patched component; all86 tests pass. This fixes the observed unnamed list-action controls but does not certify drag ordering or complete keyboard/screen-reader interaction across all collections. Browser acceptance of the newly built labels remains pending.
