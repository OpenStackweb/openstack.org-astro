# Tina branch review trial

## Current acceptance status — September 17

Tina's vendor fix is verified for bot authoring: an isolated proof save created branch `tina/editorial-proof-20260917-fixed`, content commit `f10307bc7470e4bad18e173cc84842f22c3cd11b`, and [draft PR #1](https://github.com/OpenStackweb/openstack.org-astro/pull/1) against `cms/editorial-workflow-trial`. Only the proof headline changed. No CMS upgrade was needed.

[Manual preview build 35225298753](https://github.com/OpenStackweb/openstack.org-astro/actions/runs/35225298753) passed checks, tests, Tina validation, Access validation and version upload. The main protected resolver reports the exact revision ready. Browser inspection confirmed the edited headline in [the immutable preview](https://8b3c673d-openstack-org-astro-editorial.openstack-review.workers.dev/cms-proof/) and the original headline on main. Anonymous preview requests are redirected to Access.

The follow-up R2 image save produced commit `612eb47aa97e3e8f8d394696cf6682c72a0144ca`. The draft preview rendered the saved image, and the resolver withheld the old preview until that revision built. Shared R2 delivery matched the uploaded bytes and SHA-256 across origins.

PR #1 was then merged **only into the isolated trial branch**, producing `7a1176ad10649bcf0aa34b269aeecc23c924508d`. Its built preview displayed the edit. Restoration commit `3d058b1f037cf494bfe40d7d3c3e368263f31680` returns the complete trial tree to its original baseline. [Restoration build 35227720217](https://github.com/OpenStackweb/openstack.org-astro/actions/runs/35227720217) passed; browser inspection confirmed the original headline and hero image. Main and production were unchanged.

Workflow remains off with protected-branch configuration `main`; normal demo publishing is unchanged. Preview dispatch remains manual. The isolated save/PR/media/preview/merge/restoration cycle is accepted. Main workflow rollout, personal authoring and failure cleanup remain unverified, and this does not prevent stale saves on the same branch. See [the support history and resolution](tina-editorial-workflow-support.md).

The updated read-only token now passes branch and commit-status lookup. It is installed as a secret on the main protected Astro Worker. Hosted lookup resolves the trial branch at `a7435b94ca41b73dfee66afbf40c871716a5bd9d` to its immutable preview, which opens for the signed-in reviewer. Anonymous requests to both resolver and preview return Cloudflare Access challenges. Main, invalid and missing branch states were checked with no-store responses.

Tina's View Preview link now targets the main protected resolver explicitly, including when the editor itself runs on an immutable preview host. This keeps the GitHub lookup credential on the main Worker; versioned editorial builds do not need it. An attempted regular secret update on the editorial Worker was rejected by Cloudflare because its latest version is not deployed; no editorial version was deployed to bypass that safeguard. Existing immutable builds retain their old relative link until rebuilt.

Run `node scripts/verify-editorial-github-token.mjs` after changing the ignored local `.env` token. It performs read-only GitHub requests without printing the credential. Install a replacement secret on the main Astro Worker only. Successful reads prove functionality, not the absence of write permissions; keep the token repository-scoped and read-only.

The sections below retain the implementation chronology. Earlier “not yet” statements describe those checkpoints, not the current deployment.

Prepared September 15, 2026 against Astro `9d5aa52`. This is an implementation plan, not an enabled workflow. Existing main publishing remains active. The user selected evaluation of branch-and-PR publishing; Team Plus entitlement was subsequently confirmed; see the dated evidence below.

## Recommended trial topology

Use an independent Worker named `openstack-org-astro-editorial` with Cloudflare version preview URLs. Keep the existing `openstack-org-astro` deployment and its disabled preview URLs unchanged. Upload editorial versions with `wrangler versions upload`, never deploy them to the main Worker. Reviewers receive the immutable version URL and the exact Git SHA; a stable alias is a convenience link, not the evidence of which revision was approved.

Cloudflare documents both immutable version URLs and aliases, and Access protection for previews: [preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/), [Access on Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/). Configure protection for this editorial Worker before enabling any preview URL, covering both version and alias URLs. Reuse the approved reviewer email-domain policy (`openinfra.org`, `tipit.net`) after verifying its actual configuration. No www DNS or production routing changes are needed.

## Build and publication contract

1. Begin with a manually dispatched proof-collection trial, accepting a same-repository branch and immutable commit SHA. Resolve and verify that the SHA belongs to the requested branch. Reject fork/untrusted code builds with deployment credentials. Do not use pull_request_target to execute PR code.
2. Build the verified checkout with `TINA_BRANCH` set to the exact branch, the existing public project ID and the read-only Tina content token. Run the normal checks and cloud schema validation. Confirm Tina has indexed that branch before enabling editor acceptance.
3. The separate preview uploader validates editorial Worker/account identity, no routes, no local-test auth, expected shared MEDIA bucket and no localhost editor bundle. Retain the main deploy script's existing guards unchanged.
4. Capture branch, full SHA, build run, Worker version and immutable preview URL in a review manifest. Check all unauthenticated entrypoints (HTML, assets, admin and media API) challenge through Access; repeat against both alias and version URLs.
5. Publish a preview link only after those checks pass. A later branch push creates a new manifest/version; never treat an old green result as acceptance of a new commit. Prevent slower older runs from overwriting a newer alias.
6. Merge through GitHub only after review. The established main workflow then builds/publishes the merged result to astro.openstack.org. Preview upload must not call the main deploy command or adjust its traffic allocation.

A dedicated Worker adds isolation and avoids changing the current deployment guards. Exact account workers.dev subdomain, Worker Access availability, Tina site-URL allowlisting and plan entitlement must be verified before the first remote upload. No wildcard hostname or claimed preview URL has been invented in configuration.

## CMS and media contract

Tina's [editorial workflow](https://tina.io/docs/tinacloud/editorial-workflow) creates a branch and draft PR when saving to a protected branch. Its `ui.previewUrl` hook should resolve to a successfully published preview for that branch, not mechanically return a URL that may not exist. Keep direct publishing until this is configured and accepted.

Source inspection: `tina/config.ts` already reads TINA_BRANCH. `scripts/build.mjs` passes only the public Tina project ID into Worker vars. `src/pages/api/cms/media.ts` validates request origin against its own URL, so an independent preview origin is not inherently excluded; actual Tina authentication on that origin still needs acceptance. The legacy `cms-auth.mjs` beta-only GitHub callback is not the Tina media authentication path and must not be repurposed.

`tina/r2-media-store.ts` uploads via its current origin and returns immutable content-addressed media references. Shared R2 can therefore serve committed draft references without copying the asset library. Upload bytes exist before merge; they are not branch-isolated and abandoned assets remain stored. Delete stays disabled. Do not promise Tina's repository-media branch semantics for this custom adapter. Validate one image upload, saved branch reference, preview fetch, merge and restoration explicitly.

## Acceptance sequence

Use only CMS proof content first. Record original Git blob and current main deployment identity. Save a changed headline to a new Tina branch; verify draft PR, branch content and unchanged main. Open the immutable preview and confirm its headline, metadata and manifest identify that revision. Upload/select one media item and verify the saved branch reference and image. Merge through GitHub, confirm the main deployment matches, restore proof content and verify the original blob. Retain the uploaded immutable media; no deletion test is required.

Check separate-branch competing edits and report any merge conflict honestly. Same-branch stale-tab overwrite is already demonstrated and is not solved merely by adding PRs. The user considers collisions low priority; this trial evaluates staff review and publication usability, not a new launch blocker solely for that issue.

## Current status

Plan prepared; no additional Worker, Access application, Tina protected branch, billing change or preview workflow enabled. Paid-plan entitlement and editorial controls are confirmed below; preview protection and publication remain pending. Safe implementation preparation can proceed without changing the current demo site's publishing behavior.

## Entitlement confirmed — September 15

After the user reported upgrading, read-only authenticated dashboard inspection confirmed **Team Plus is the current plan**. Configuration now shows an enabled (not disabled by plan) Editorial Workflow checkbox and editable Protected Branches containing `main`; the workflow checkbox itself is unchecked. Site URLs still lists only `https://astro.openstack.org`. No setting was toggled or saved and no billing action was taken. The paid-entitlement question is closed; remaining prerequisites are the protected preview origin, exact-branch build/publication and acceptance above. Do not enable main protection before reviewers have a working branch preview path.

## Local configuration preparation implemented

Run the normal hosted `npm run build`, then `node scripts/prepare-editorial-preview.mjs`. It writes ignored `dist/server/wrangler.editorial.json` beside the generated main config, preserving relative entry and asset paths. The source main config is unchanged. The preparer requires the expected account/main Worker, hosted Tina project ID, shared media bucket, no hostname routes and no local-test authorization. It rejects extra environment variables rather than copying credentials. Only explicitly allowed build/runtime settings are copied; business-service bindings are not inherited.

Both workers.dev and preview URLs remain false. This artifact is bootstrap preparation, not a working branch preview, not proof of build provenance, and not an upload command. Guard tests passed and `wrangler deploy --dry-run --config dist/server/wrangler.editorial.json` completed successfully against the current built output. Next implement Access-protected bootstrap and exact-branch/SHA build manifest before enabling version URLs. No remote resource was created during this step.

## Exact-revision build preparation

`node scripts/build-editorial-preview.mjs <local-branch> <full-commit-sha>` now validates a clean checkout, the authorized repository origin, and matching HEAD/local branch revision before and after the normal hosted build. It sets `TINA_BRANCH` for the build and prepares the isolated Worker configuration. It invalidates any previous manifest before building, then writes SHA-256 fingerprints of client/server output to ignored `dist/editorial-preview-manifest.json`. Symlinked output is rejected.

This is a trusted local build tool, not remote branch verification or a CI trust boundary. The requested branch must already exist locally at the intended full SHA. It does not upload, enable URLs, or change Tina settings. A future uploader must verify these fingerprints and remote branch state again. Unit tests cover wrong repository, dirty checkout, main branch and revision mismatches; an actual exact-branch hosted build remains pending.

Cloudflare's automated dashboard login is challenged in the current browser. The existing `openinfra` Wrangler OAuth login supports Worker operations but lacks Access management. The user has been given normal-browser instructions to create an account-scoped `Access: Apps and Policies` Edit/Write token and store it only in ignored `.env` as `CLOUDFLARE_ACCESS_API_TOKEN`. Token creation and Access configuration are not yet verified. No production policy or routing change is intended.

### Build and artifact acceptance — September 15

The first real trial branch `cms/editorial-workflow-trial` was pushed at `5f02fd1fbc1e534893e78a43e49e86a156a51b0a`. Exact-revision build completed normally, including TinaCloud indexing/schema checks. The generated admin bundle contains that branch and the manifest covers 310 files. Both URL types remain disabled; no editorial Worker upload has occurred.

`node scripts/verify-editorial-preview.mjs <editorial-branch> <full-commit-sha>` now checks the branch directly against the fixed authorized GitHub repository and compares the entire output file list/hashes with the build manifest. Modified, missing, extra and symlinked files are rejected. This command verified the actual trial output; five preview tests pass. It is a read-only preflight, not Access verification or publication. Repeat it immediately before a future upload; remote branch movement after verification remains possible and final review links must always identify the immutable version and commit.

## Protected remote trial — September 15

User selected `openstack-review.workers.dev`; account registration and readback succeeded. Created only the separate editorial Worker, ID `947061288427444b969d1690ed3f9cd9`. First upload failed10021 because ESModule packaging rules had been omitted; f5bc6ae restores/validates the generated rules, and the rebuilt exact branch passed validation. Successful bootstrap version `15b6bc10-b716-4814-a828-7e78ef9218cd` had no URL targets.

Created Access application `eae40719-c49d-4b63-8694-a80c22631489`, single `worker` destination targeting that editorial Worker, six-hour session, copying the established reviewer allow-list including openinfra.org and tipit.net. Existing Astro/beta applications unchanged. Uploaded trial version `fb99cdca-8664-43c7-97c0-66f244dedc85` for branch `cms/editorial-workflow-trial` at `f5bc6ae204a73dca74ea6a5642b3176cefc1547e`, alias `editorial-trial`. After Access readback, enabled preview URLs only through the Worker subdomain API; base workers.dev URL remains disabled.

- Immutable review: https://fb99cdca-openstack-org-astro-editorial.openstack-review.workers.dev/cms-proof/
- Alias: https://editorial-trial-openstack-org-astro-editorial.openstack-review.workers.dev/cms-proof/

Anonymous requests to root, admin, an image path, media API and proof page redirect302 to the existing Cloudflare Access host on both version and alias. Authenticated browser loaded the proof page. Tina Site URLs now retains astro.openstack.org and adds only `https://*-openstack-org-astro-editorial.openstack-review.workers.dev`. Save persistence verified by a new browser session after automation process exit. Preview admin login succeeds with the existing Tina session and renders homepage editing fields. Workflow checkbox remains off.

This is a manually published trial, not automated branch/PR acceptance. Source preparer still intentionally emits preview_urls=false; future upload tooling must deliberately handle the verified Access prerequisite and preview toggle. Do not deploy the main Worker using the editorial config. Remaining: branch save/PR/build integration, previewUrl mapping to successful builds, media branch round-trip, reviewer approval/merge/restoration, and failed-build/stale-preview handling.

### Repeatable uploader and manual GitHub trial

`scripts/upload-editorial-preview.mjs <branch> <sha>` validates the exact artifact/config, fixed Worker identity and current Access policy against the approved Astro policy. It uploads a version, checks revision/fingerprints again, enables previews only after Access readback, verifies ten anonymous route challenges, and writes ignored `dist/editorial-publication.json`. Failure during post-enable challenge checks disables editorial preview URLs. The alias includes a branch hash and commit prefix so a different commit does not silently replace that link. Immutable version URL remains the review evidence.

Actual CLI trial succeeded for f5bc6ae: version243af093 (full ID recorded in local publication manifest), URL https://243af093-openstack-org-astro-editorial.openstack-review.workers.dev . No main deployment command was invoked. Added manual-only `Build editorial branch preview` workflow: dispatch from main with trusted same-repository branch/full SHA; ordinary push does not invoke it. It builds exact branch content, uses normal TinaCloud schema checks, and reports immutable URL/revision/version in the run summary. Cloudflare credentials are limited to the upload step. Account Access token is stored as a GitHub Actions secret; no value committed. The workflow still needs a successful actual GitHub dispatch before CI acceptance. Automatic PR mapping, Tina previewUrl and editor branch-save/merge acceptance remain unfinished.

### Tina preview resolver and private repository prerequisite

Added synchronous ui.previewUrl pointing to `/review/branch/?branch=…`. The protected review page resolves the branch's current SHA and the latest `OpenStack editorial preview` GitHub commit status, accepting only success for that SHA with an immutable editorial Worker URL. Missing/pending/failed/unavailable branches receive explanatory states instead of an older preview. Manual workflow now reports pending/success/failure statuses; success comes only after upload and Access checks.

The repository is PRIVATE (verified by gh repo view). Anonymous GitHub lookups return404 even for a valid branch; therefore the server requires optional Worker secret `EDITORIAL_GITHUB_TOKEN`, a fine-grained token limited to this repository with Contents Read and Commit statuses Read. User has been asked to provide it in ignored local .env; do not persist the CLI's broader login as a runtime secret. Without it the page explicitly reports status unavailable and performs no GitHub request. Temporary read-only CLI-authenticated resolver check found the actual branch/SHA and pending status. Four resolver tests pass; Astro check283files0errors0warnings2hints. Local375px fallback screenshot reviewed, no overflow. Full hosted build/schema and actual status-ready link acceptance follow publication; no main Editorial Workflow enable yet.

Status lookup acceptance: GitHub run35029770892 completedSUCCESS for5f6e078, and its commit status changed from pending to success with immutable URL https://f999aef7-openstack-org-astro-editorial.openstack-review.workers.dev . A read-only resolver call using the existing CLI login (in memory only) returned ready with the exact SHA/URL; authenticated browser loaded the proof heading. The resolver now rechecks branch head after finding success, returning pending for a newer SHA if the branch advanced during lookup. Five resolver tests pass, including this race; normal hosted build passed. Long-term Worker read-only token remains unconfigured at this checkpoint, so hosted resolver acceptance itself is still pending.

### Paid workflow save/PR trial failed; settings restored

Two isolated proof-title attempts on protected cms/editorial-workflow-trial created branches and then failed at TinaCloud workflow status500. No edit commit or PR was produced. Main remained unprotected and its proof blob unchanged. See [support reproduction](tina-editorial-workflow-support.md) for request IDs/evidence. Discarded drafts; restored workflowOFF and protected-branch listmain. This supersedes any implication that plan entitlement or a working branch preview establishes Tina save/PR acceptance. Build/upload/status infrastructure passed, while actual paid workflow completion is unresolved. No support message sent.

Dashboard detail: the input[type=checkbox] is the separate-content-repository control, not Editorial Workflow. Inspect the visible Enable toggle itself (off thumb translate-x-1; on translate-x-7) and verify after reload. Earlier checkbox-only readings were insufficient evidence. Workflow and branch-list changes auto-save; disabled Save Configuration is not a failure.
