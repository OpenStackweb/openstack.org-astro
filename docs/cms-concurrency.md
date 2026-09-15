# CMS concurrency acceptance — September 14, 2026

**Save-conflict protection failed in the hosted proof-page test.** This remains a known limitation, not an editorial-content question. On September15 the user clarified that editing collisions are not a major concern; do not block the demo or introduce a branch workflow solely for this issue. The test used two tabs in the same authorized editor session; it does not establish behavior across distinct Tina users or every collection.

## Verified behavior

Both tabs loaded the original `src/lib/content/cms-proof/home.json` (Git blob `fc2fc5b7ce439556dc177cb0a675ceeee69561f8`). Tab A changed only the headline; tab B changed only the introduction without reloading.

1. A saved successfully, commit `862212b2a5cc136cea500c498720ea7859ec8cae`; Git confirmed the new headline and original introduction.
2. B still displayed the old headline. B saved without a visible conflict warning, commit `5f07954fa6d3c56da09f85a4e7c3c090bc41e955`. Git now contained B's introduction and the original headline: A's saved headline was lost.
3. B restored the original introduction and saved, commit `2eddc8f1eb0e60be9a36f64bca337998db94ffb1`. Git blob exactly matches the original. A's stale tab was closed. Reloaded B shows original values with Save/Reset disabled. Hosted deployment cleanup is recorded separately.

The installed TinaCMS 3.13.0 client transforms form values and calls `updateDocument` with collection, relative path and parameters, with no explicit expected revision argument in this path (`node_modules/tinacms/dist/index.js`, `TinaAdminApi.updateDocument` and collection form update helper). That source observation is consistent with the actual overwrite; it was not used alone to claim a server-side failure.

## Preview isolation passed independently

`AUDIT_BASE=http://127.0.0.1:4536 node scripts/check-preview-isolation.mjs` sends sixteen overlapping, distinct homepage draft overlays to the normal built Worker. Each response contains only its own draft headline. Concurrent ordinary homepage requests and the final baseline remain unchanged. No requests save to Tina/Git. This verifies request-local draft isolation, not distributed load, distinct-user permissions or save conflict protection.

## Recommended next decision

Before multi-editor launch, require either verified stale-save rejection/merge support from TinaCloud or an editorial branch-and-PR workflow with review. A client-side “check latest before save” can reduce stale-tab accidents but has a race between checking and writing; it must not be described as atomic conflict protection.

Tina's [official editorial workflow documentation](https://tina.io/docs/tinacloud/editorial-workflow) describes changes on separate branches with draft PRs and GitHub merging, available on select paid plans. Our integration has not enabled or accepted that workflow. Separate branches improve review and expose Git merge conflicts, but same-branch concurrent edits still need testing; the custom R2 store and branch preview routing also need explicit acceptance. Do not infer that the documented repository-media workflow automatically covers our R2 adapter.

Until a solution is implemented and verified, coordinate one editor per document. Git history supports recovery, but that is not prevention. Keep the demonstrated direct-publish workflow for the protected POC; no permissions or publishing policy were changed by this investigation.

Cleanup acceptance: Publish34917716834 and Validate34917716804 succeeded for2eddc8f. After the user renewed Cloudflare Access, a fresh standalone `/cms-proof/` Chrome view and screenshot confirmed the original title and introduction match the restored Git document. Hosted visual cleanup is verified. The earlier reloaded CMS form showed original values and disabled Save/Reset. The restored document is byte-identical to the pre-test Git blob. No production content was touched.

## September 15 — workflow integration assessment

Reviewed at Astro2cc17aa: `tina/config.ts`, `tina/r2-media-store.ts`, `src/pages/api/cms/media.ts`, and `.github/workflows/publish-preview.yml`. Rechecked the official editorial-workflow documentation; it still specifies select paid plans, branches/draft PRs and GitHub merging. No plan or Tina project setting was changed.

The current deployment listens only to main pushes and explicitly checks out/builds main with TINA_BRANCH=main. Merely enabling Tina's branch switcher would not create independently deployed branch previews. Proposed implementation must keep main publishing intact, add an approved protected preview mechanism, and prove the branch being edited matches the content being reviewed.

Our R2 adapter uploads independently of a Git branch: it sends only the file, hashes its bytes and returns an immutable content-addressed URL. Content references can therefore be reviewed in Git while the bytes already exist in shared protected storage. The adapter's delete method rejects deletion, and the server accepts only GET/POST, so a draft cannot remove an asset used by another page. This is useful compatibility, not branch-isolated media or acceptance of Tina's repository-media PR behavior. Abandoned uploads remain stored; garbage collection would need reference checks across retained branches before any deletion. Do not introduce automatic deletion as part of the workflow trial.

Acceptance for a branch-workflow trial: use only the disposable proof collection; show Save creates the intended branch/PR, verify draft copy and media in the protected preview, confirm main stays unchanged before merge, merge via GitHub and verify the deployment, then restore proof content. Repeat competing edits from separate branches and from two tabs on the same branch; a branch workflow must not be described as solving same-branch stale saves without evidence. The user's workflow preference has been requested; existing direct publishing remains unchanged meanwhile.

## User direction — September 15

The user intends to use a paid Tina plan and can upgrade, but says editing collisions are not a big concern. Continue the established direct-publishing workflow. Record the demonstrated overwrite limitation and retain Git recovery; deprioritize collision mitigation in favor of page/CMS functionality. Paid-plan intent does not select branch-and-PR publishing, prove an upgrade occurred, or authorize a billing change. The branch-workflow assessment above remains an option, not active implementation work.

### Subsequent user selection

The user subsequently answered the pending workflow question: **evaluate branch-and-PR workflow**. This supersedes the decision to defer that evaluation, while preserving the user's statement that collisions are not a major concern. Evaluate review usability, protected previews and custom R2 compatibility. Current direct publishing stays active until the trial is concretely configured and verified; no billing change or completed upgrade is implied by this selection.

## Hosted plan/configuration inspection — September 15

Read-only authenticated Tina dashboard inspection confirms this project remains on Free, with site URL astro.openstack.org, the expected GitHub repository, and indexed branches main and cms/tina-proof. Configuration currently hides workflow controls behind text saying Business or Enterprise is required. However, both the dashboard Plan page and the [public pricing page](https://tina.io/pricing) list Editorial Workflow under Team Plus. The dashboard displayed49USD/month for Team Plus; public annual pricing displays490USD/year. Treat the configuration wording as inconsistent with the plan listing, not proof that Business is necessary or that Team Plus entitlement has been tested.

No plan selected, checkout opened, configuration saved or workflow enabled. A paid upgrade must be performed by the user or separately authorized. After the upgrade, first recheck actual workflow control availability. Then trial a disposable protected branch before changing main's established publishing path. Keep the main-only Worker deployment guard in place until protected branch previews have their own concrete configuration and acceptance.

September15 upgrade confirmed: user reported the upgrade and the authenticated Plan screen explicitly shows Team Plus as current. Editorial Workflow configuration is now unlocked, checkbox unchecked, Protected Branches contains main. Read-only inspection only; no configuration or billing changes. This supersedes the earlier Free-plan observation. Continue the concrete [branch preview trial](tina-branch-preview-plan.md) before enabling main protection; entitlement does not establish working branch previews or solve stale saves.
