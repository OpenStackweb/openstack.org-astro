# Release announcement editing

Release announcements are Git-owned editorial content, separate from structured releases in the Software service. SilverStripe `SoftwareSubPage` inherits `Page.Content` (source2172298743fe807a92758cf307059b69a7dba668). The seven existing imported announcements preserve their public contributor credits and order. No Software service records or member profiles are edited here.

Tina's **Release announcements** collection exposes the slug, headline, search/sharing description, HTML or Markdown body, contributor introduction and ordered public contributor names. Existing announcement pages use the same Astro renderer inside a primary Tina preview island. Optional copy can be cleared. Saving an existing document rejects slug changes, protecting published links. Deletion is disabled. New entries use the slug as their filename.

Publishing an announcement does not change the Software API's current release, the homepage's release promotion, or the announcement banner. Those are separate editorial/service choices. A new document's public route becomes available after its Git commit is built and deployed. Previewing an entirely new, not-yet-built document is not implemented by the current loader; create/draft-preview acceptance remains open.

## Verification and remaining acceptance

- All seven existing records pass the actual submit hook without field or contributor-order changes.
- Tests cover invalid data, stable existing slugs, valid new slugs, clearing optional copy, and generated schema coverage. All40 repository tests pass.
- Astrocheck187files reports no errors, warnings or hints. Local Tina compilation and full Astro build pass.
- Fresh built preview4451 verified one unchanged heading and the exact ordered contributor list for every announcement after the island integration.
- Normal cloud build initially failed because TinaCloud had not indexed the new `ReleaseAnnouncement` type. Deployment must pass that gate after the schema commit is indexed; it is not bypassed for publishing.
- Chrome is disconnected. Actual existing-document edits, contributor add/reorder/remove/reset, invalid-save UI, new-document creation, draft preview, hosted publish/deploy and R2 media insertion are not yet browser-verified. These are acceptance gaps, not a complete replacement-workflow certification.
