# TinaCloud editorial workflow trial — failure history and verified fix

Observed September 15, 2026. Prepared for support/reproduction; **not sent** to Tina or anyone else. Root cause remains unknown. HTTP500 from the workflow service is evidence of failure, not proof that the defect is exclusively server-side.

## Resolution verified September 17, 2026

Following Tina support's reported production fix, the same installed CMS successfully saved through Editorial Workflow using TinaCloud bot authoring. Request `b24ce5d4-1f11-4d11-9054-17a7efa07c22` progressed from queued/indexing to HTTP200 complete, “Changes saved and ready for review!”.

GitHub independently confirmed branch `tina/editorial-proof-20260917-fixed`, content commit `f10307bc7470e4bad18e173cc84842f22c3cd11b`, and [draft PR #1](https://github.com/OpenStackweb/openstack.org-astro/pull/1) targeting the isolated trial branch. Its sole change is the CMS proof headline. The manually dispatched [protected preview build](https://github.com/OpenStackweb/openstack.org-astro/actions/runs/35225298753) passed; browser inspection verified the new headline and the exact-revision resolver link. Main's original headline remains unchanged.

Workflow was disabled again and its protected-branch configuration restored to main. The draft PR remains unmerged as evidence. No production data or routing changed. This verifies the bot-authoring success path without a CMS upgrade; personal authoring and the vendor's reported improved error/empty-branch cleanup paths were not tested. No support message was sent by the agent. The sections below preserve the earlier failure evidence rather than describe the current happy-path result.

## Environment

- Project: Open Infra / openstack.org-astro, public project identifier `cb0c99a2-531f-447e-91b1-6ad50fde64b5`.
- Private GitHub repository: OpenStackweb/openstack.org-astro.
- Team Plus plan verified in dashboard.
- TinaCMS3.13.0, CLI2.7.0, @tinacms/astro0.7.0.
- Astro preview revision5f6e07842fd618ac85a88c247a8cf848d4beb2e3.
- Editor: https://f999aef7-openstack-org-astro-editorial.openstack-review.workers.dev/admin/#/~/cms-proof/ (Cloudflare Access protected).
- Hosted editor login, normal TinaCloud schema validation and GitHub branch-preview build/upload have passed independently.

## Reproduction

1. Enable Editorial Workflow with only `cms/editorial-workflow-trial` protected. Main remains unprotected during the test.
2. Open CMS proof collection, `src/lib/content/cms-proof/home.json`, on that branch.
3. Change only Headline from “OpenStack — Tina and R2 editing proof” to “OpenStack — editorial branch review trial”.
4. Save opens the new-branch prompt. Choose a unique name and Save draft.
5. UI progresses through branch creation/indexing, then displays “Failed to complete workflow. Please try again.” No pull request is created.

## Recorded attempts

| Branch | Workflow request ID | Result |
| --- | --- | --- |
| tina/editorial-proof-20260915 | c4ea04fd-d7cc-4281-89b8-25e7cf64d9cf | Branch created; indexing event succeeded; workflow status500/error; no content commit/PR |
| tina/editorial-proof-20260915-retry | 6ac9328f-fc72-4f78-ac71-746ae7d90bde |202 queued,202 indexing twice,500 error; no content commit/PR |

Status route: `https://content.tinajs.io/editorial-workflow/{projectId}/status/{requestId}`. Response message is generic; no `errorCode` or `pullRequestUrl` returned. First branch event log: indexing started22:19:56UTC and succeeded22:20:01UTC. Both created Git branches remain at the base SHA5f6e078; no content change was committed. Original proof Git blob is `fc2fc5b7ce439556dc177cb0a675ceeee69561f8`; main and protected trial remained unchanged. No media upload was involved.

Source inspection confirms the installed client sends the workflow request then polls the status endpoint; its generic error matches the service response. No speculative client/API patch has been applied. The existing local Tina patches affect field labels, keyboard/list controls and React Final Form behavior; they do not modify executeEditorialWorkflow or polling.

## Restored state and questions

Discarded both unsaved drafts through explicit Reset confirmation. Original headline restored and Save disabled. Editorial Workflow disabled; protected-branch configuration restored to `main`, and verified after reload. Diagnostic branches retained without edits. Main publishing and production routing were not changed.

Ask support to locate the failing workflow stage using the request IDs and explain whether the content operation, repository permissions, protected base branch handling or another requirement caused the failure. No credentials, auth headers or user tokens are included here. Verify an actual edit commit and draft PR before claiming Editorial Workflow acceptance.

## September 16 retry after Team Plus restoration

Current Team Plus entitlement verified in the dashboard. Enabled Editorial Workflow only for `cms/editorial-workflow-trial`; main stayed unprotected. In the authenticated immutable preview `9e05faa0`, changed only the proof headline and requested draft branch `tina/editorial-proof-20260916`.

Request `094b256e-c66f-4952-a05d-557fd7ebe534` returned 202 queued, then 202 indexing (“Branch created, waiting for indexing…”), then HTTP500/error with the same generic failure. GitHub confirmed the new branch is identical to the base `a7435b94ca41b73dfee66afbf40c871716a5bd9d` (zero commits ahead, zero files changed); no pull request exists. No content commit was saved.

Canceled the workflow dialog and confirmed Reset. Original headline restored, Save disabled. Disabled Editorial Workflow and restored protected-branch list to main; reload confirmed both. The diagnostic branch remains for investigation. Main content and production are unchanged. The separate protected preview resolver now works with its read-only GitHub credential, so that former lookup issue is resolved independently of this workflow failure. This report remains unsent.
