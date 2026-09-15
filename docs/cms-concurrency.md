# CMS concurrency acceptance — September 14, 2026

**Save-conflict protection failed in the hosted proof-page test.** This is a launch gate for simultaneous editing, not an editorial-content question. The test used two tabs in the same authorized editor session; it does not establish behavior across distinct Tina users or every collection.

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
