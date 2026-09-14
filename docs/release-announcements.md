# Release announcement editing

Release announcements are Git-owned editorial content, separate from structured releases in the Software service. SilverStripe `SoftwareSubPage` inherits `Page.Content` (source2172298743fe807a92758cf307059b69a7dba668). The seven existing imported announcements preserve their public contributor credits and order. No Software service records or member profiles are edited here.

Tina's **Release announcements** collection exposes the slug, headline, search/sharing description, HTML or Markdown body, contributor introduction and ordered public contributor names. Existing announcement pages use the same Astro renderer inside a primary Tina preview island. Optional copy can be cleared. Saving an existing document rejects slug changes, protecting published links. Deletion is disabled. New entries use the slug as their filename.

Publishing an announcement does not change the Software API's current release, the homepage's release promotion, or the announcement banner. Those are separate editorial/service choices. A new document's public route becomes available after its Git commit is built and deployed. The CMS opens `/cms-preview/release/SLUG`, which can seed a form for a saved CMS document absent from the current website build. Tina supplies its draft content through the preview overlay. Public routes remain limited to bundled announcements. Local create/edit/preview checks are recorded below; hosted acceptance remains open.

## Verification and remaining acceptance

- All seven existing records pass the actual submit hook without field or contributor-order changes.
- Tests cover invalid data, stable existing slugs, valid new slugs, clearing optional copy, and generated schema coverage. All40 repository tests pass.
- Astrocheck187files reports no errors, warnings or hints. Local Tina compilation and full Astro build pass.
- Fresh built preview4451 verified one unchanged heading and the exact ordered contributor list for every announcement after the island integration.
- Normal cloud build initially failed because TinaCloud had not indexed the new `ReleaseAnnouncement` type. Deployment must pass that gate after the schema commit is indexed; it is not bypassed for publishing.
- Chrome is disconnected. Actual existing-document edits, contributor add/reorder/remove/reset, invalid-save UI, new-document creation, draft preview, hosted publish/deploy and R2 media insertion are not yet browser-verified. These are acceptance gaps, not a complete replacement-workflow certification.

## Unpublished preview verification

The initial editor deployment4360a99 passed publishing34798856564, including the normal TinaCloud schema gate. The follow-up preview implementation passed the normal TinaCloud/full build, Astrocheck188files0/0/0 and42 tests. Tests include unpublished opt-in and safe document names.

A fresh built preview4452 was exercised using Tina's documented installed bridge protocol: prime the island with `X-Tina-Prime`, obtain its form ID, then send a transient draft overlay. An unpublished headline, body and ordered credits rendered; script content was removed; a subsequent GET retained the empty seed. An invalid filename returned400 and the ordinary public URL stayed unpublished. No Git file, service record or mailbox changed. The initial test incorrectly expected form metadata in a normal GET; the corrected check uses the actual priming protocol. This proves server rendering and isolation, not the complete browser creation flow.

## Latest-release shortcut

Astro's `/latest-release` and `/latest-release/` now follow the homepage's `latestRelease.cta1_link`, matching the existing SvelteKit workflow. They previously rendered a generic migration notice even though the copied destination validator existed. GET and HEAD return307 with `Cache-Control: no-store`, retain incoming query parameters, and resolve only a bundled announcement. Same-origin unsupported methods return405. Astro's existing origin protection can reject unsupported requests earlier; it was not weakened.

The helper accepts relative URLs and the known production/beta/Astro origins, then normalizes to a local announcement path. It rejects external, credentialed, port-qualified, unpublished, looping or query/fragment-bearing configured destinations. The homepage now provides a published-announcement selector and whole-form save validation; see the selection checks below.

Verification: all45 tests, Astrocheck190files0/0/0 and normal TinaCloud/full build passed. Fresh preview4453 verified both slash forms and GET/HEAD, query preservation, no-store/noindex, same-origin POST405 and the final announcement200. The first POST probe without Origin was rejected403 by Astro; the corrected same-origin test exercised the route handler. No CMS content or Software service data changed.

## Homepage release selection

The Homepage → Release promotion editor now loads the current website build's announcement titles and local paths from the read-only `/api/cms/releases` endpoint. It preserves the stored selection on load and offers Refresh announcements after a deployment. The save hook fetches a fresh list and rejects external, unpublished, blank or looping choices. Publishing an announcement still does not automatically promote it.

The endpoint exposes only already-public slug/title/path values, not contributor records, credentials or Software API data. A failed lookup prevents an unverified save. No CMS content was changed during implementation.

All48 tests and Astrocheck194files0/0/0 pass. Local Tina compilation and full Astro build pass. Freshpreview4454 endpoint matches the exact seven stored announcement projections; the real save hook using that endpoint accepts the current homepage unchanged and rejects an unpublished choice. Homepage200 and latest-release307 remain intact. Normal cloud build initially requires the changed schema to be indexed after the commit; the deployment gate remains enabled. Browser dropdown/loading/retry, selection/save/reset and hosted round-trip acceptance remain open.

## Local release workflow browser verification

Chrome created a temporary announcement using Add File in isolated Tina local mode. The resulting file preserved the six editorial fields and an empty contributors list. Opening it exposed a routing defect: Tina dropped the query string, leaving the preview without its document ID. The collection now uses `/cms-preview/release/SLUG`; the earlier query URL redirects to it for compatibility. Chrome verified the corrected route loads both the editing form and rendered announcement.

Adding two public credits and saving preserved their order in JSON and preview. Removing the first and saving left only the second in both. Changing the saved slug was rejected without modifying the file, but the editor did not show a useful error and left Save disabled; Reset recovered the form. This validation-feedback issue and the native list's unnamed icon buttons/reordering keyboard acceptance remain open. The temporary announcement was removed before building; no test content or service records are published. Hosted TinaCloud create/publish/deploy and a browser preview of a document absent from the deployed bundle remain separate acceptance items.

The earlier homepage selector browser checks now pass locally: selection/save, Refresh, Reset, exact original-content restoration, and `/latest-release/` following the saved destination. The mobile admin fix a55feb5 deployed successfully (Publish34800440525).

### Saved-slug feedback correction

The release slug now validates against Final Form's initial field value before submission. An attempted rename reports “Keep the saved release slug unchanged to preserve existing links. Restore its original value to continue.” Restoring the original clears the error. New documents can still choose their slug; the existing whole-form guard remains as a second check.

Code evidence: installed Tina passes Final Form's field-state metadata into the custom validator; installed Final Form includes `initial`. A regression test uses that installed Final Form implementation to exercise invalid → restored state and confirm the error and recovery. All50 tests and Astrocheck195files pass. Chrome disconnected while opening the existing Gazpacho form, so visual feedback acceptance is still pending; no saved content was changed. Contributor button labels and keyboard reordering remain open.

### Contributor controls and recovered Chrome acceptance

The contributor field now has labeled name inputs and explicit Move up, Move down, Remove and Add controls. It displays 25 rows at a time while retaining the complete ordered string array. Moving across a page boundary follows the moved credit and focuses its input; adding follows the new last row. Duplicate names are preserved. The field is registered as a Tina plugin, with no GraphQL/data-shape change.

Chrome recovered without opening a recovery window. The remaining tab was the isolated local editor at127.0.0.1:4457; restarting it and reloading rendered Gazpacho normally. This does not establish the cause of the earlier reported generic Tina error. The saved-slug error was visibly verified and Save was disabled before submission; restoring Gazpacho cleared the invalid edit.

Using the local backend, keyboard Enter moved credit25 down across the page boundary and focused credit26. Save changed exactly that adjacent pair; moving it back restored the order. Add/Save preserved all389 existing credits and all other fields; Remove/Save removed only the disposable390th credit. Reset discarded an unsaved reorder. The original file was restored byte-for-byte. No test names were committed or deployed.

Mobile390px initially exposed Tina's inherited nowrap helper text; explicit wrapping and fieldset/input sizing corrected it. Final Chrome measurement: contributor field clientWidth334/scrollWidth334, with the browser viewport reset afterward. Hosted save/publish, empty-list and maximum-size browser acceptance remain open. This completes the previously recorded local slug-feedback and basic keyboard reorder gaps, not the full migration acceptance audit.

Final checks:50 tests and Astrocheck196files0/0/0 pass. The normal pre-push TinaCloud build stopped because the remote schema had not indexed the new custom-field configuration. Local compilation is checked separately; publishing retains the normal cloud schema gate. This status is not a claim of deployment success.


## Hosted creation and publishing acceptance — September 14

TinaCloud Add File created a clearly labeled temporary announcement with slug, headline, description, Markdown body and one synthetic contributor credit. Commit `c85c7bd472fb503e1de02be7369d884466849f8c` changed exactly one new document; its six stored fields matched the entered values. The dedicated preview displayed the saved copy and credit before the deploy finished. Attempting to rename its saved slug showed the intended validation message and disabled Save; restoring the original slug cleared the edit.

Protected Publish34890011332 completed successfully. A fresh Chrome tab at the standalone announcement URL displayed the expected headline, Markdown heading/body and credit. No homepage promotion, announcement banner, existing release document or Software-service data changed. The temporary document was removed through Git afterward because CMS deletion is intentionally disabled; cleanup Publish34890275819 succeeded, and Chrome confirmed the former URL returns to the Software review notice. All Git content matches the pre-test revision. This closes basic hosted create→Git→preview→deploy acceptance, not media insertion, concurrent editing, duplicate-slug handling or complete contributor-list limits.
