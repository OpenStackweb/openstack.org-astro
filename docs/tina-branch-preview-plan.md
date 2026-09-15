# Tina branch review trial

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
