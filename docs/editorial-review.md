# Editorial review queue

Staff worksheet: [OpenStack website — editorial review](https://docs.google.com/spreadsheets/d/1rnrG7pO4p5QQfnABIaqkP4_HwZf5SbFJs-xTnU33DHk/edit). Created September 15 in the connected user's ChatGPT Drive folder with six editorial items, recommendations, evidence links, decision cells and status choices. Sharing permissions were not changed. Native import, all six rows and dropdown validation were read back; the exported workbook was rendered and inspected because the review browser was not signed into Google.

The linked Google Sheet is the staff decision worksheet, not a request to rewrite the archives. Prefer a defensible source-based correction. Preserve historical material with archive context; only ask staff when evidence cannot settle the outcome. Technical implementation, application ownership and production cutover tasks are tracked separately.

| Item | Affected content | Evidence / best-effort position | Input still useful |
| --- | --- | --- | --- |
| Missing China Mobile paper | Use Cases catalogue / China Mobile | Original 01.org download now redirects to general Intel HTML; historical Galera mirror also redirects elsewhere. No verified local original found in the targeted search. Preserve story facts. | Approved original PDF or permission to label this download unavailable. |
| Missing reference architecture PDF | Use Cases catalogue | Original WordPress URL ultimately returns 404. A 21-page SlideShare reading copy with matching subject/authors was found; not proven to be the original downloadable artifact. | Approved replacement/original, or mark original download unavailable. |
| Vancouver registration illustration | Historical Vancouver FAQ | Dropbox link returns an error document; no verified replacement found. This is historical registration guidance, not a current registration workflow. | Retain an unavailable-image notice or provide the original illustration. |
| Marketing sticker sheet | /marketing/ historical graphics | Source action points to /assets/ rather than a file. Already visibly marked unavailable. Other supplied graphics remain downloadable. | Correct sticker-sheet download if still useful. |
| Localized paper image descriptions | German, Indonesian, Japanese and Korean papers | Descriptions were drafted from the actual cover artwork. Existing paper translations were preserved. | Optional native-language review of the new descriptions; no full translation rewrite requested. |
| Current-sounding legacy claims | Industry landings and old event resources | Keep dated publications and archive notices. Expired-event marketing is not evidence of a future event. Existing metrics/services should not silently be presented as freshly verified. Public redirect checks also confirm that production sends `/summit/` to Vancouver 2023 and `/summit/2020/` to a generic Foundation landing; these inherited destinations are preserved pending a current events/archive decision. | Later decision on which actively promoted claims/pages deserve current business review. |

Detailed evidence: [external download review](external-download-review.json), [external redirect evidence](external-redirect-audit.json), [SEO notes](seo-open-graph-notes.md), [browser pass](browser-review-2026-09-14.md). These rows are provisional and should be reduced as additional source recovery succeeds. The worksheet now links each affected page directly, including individual localized paper editions. Source evidence links remain separate.

## Migration and application ledgers — September 15

The same workbook now also contains **Migration verification** (sheet491260215,
A5:H408) and **Applications and decisions** (sheet1624837090, A5:H109).
The original Editorial review tab and its decision cells were preserved.

- Migration verification contains403 entries:32 platform/section workstreams,
  215 individual generic editorial records, and156 known redirect records.
  Seven historical software release archives and dedicated collections are
  described in workstream rows, not added to the215 generic-page count.
- Applications and decisions contains104 entries:102 known notice routes plus
  Software and Astro visitor authentication. Staff can enter an owner/decision
  in column F. Deferred route coverage is not implemented application parity.
- Page and evidence links are provided on every row. Source links are pinned to
  commit0d0c2dd, so this is a dated checkpoint, not a live deployment dashboard.
- Every authored value and hyperlink matched connector readback. Exported
  renders of both tabs and detail rows were inspected. The rendering library
  displayed an empty shared-string index in blank staff cells; native Sheets
  CellData confirmed those cells have no value. No dummy decision was written.

Keep staff decisions authoritative: refresh implementation/evidence columns by
matching page URLs and workstream labels, never replace the entire tabs from an
old generated file. Reconcile decisions before refreshing. Broader acceptance
remains open and this workbook is not a production-cutover approval.

## Later September 15 acceptance evidence

The ledger counts above are historical, not current totals. The later workbook checkpoint
is recorded in the vault handoff: 220 generic records (186 Tina-managed, 34 Git-only),
with subsequent Science/Marketing saved-edit and protected-preview rows added.

Current technical evidence:

- [Audit refresh](audit-refresh-2026-09-15.md): SEO 1,253 targets without metadata findings;
  links 252 source pages / 756 targets without HTTP 404 findings after four exact blog
  migration notices were added. Notices remain deferred applications, not migrated content.
- The six Marketing `#tab=` fragment warnings were subsequently checked in the hosted
  browser: each of collateral, events, get_involved, graphics, promote_product and software
  selects exactly one visible panel. Historical panels receive focus. Their JavaScript
  behavior explains why matching literal IDs are absent from the static audit.
- [External redirect recheck](external-redirect-check-2026-09-15.json): all 29 current
  redirect destinations return HTTP 200. This refresh includes the release-announcement
  audit expansion and does not resolve editorial quality questions. Browser review confirms
  `/summit/` still advertises June 2023 as coming soon; the existing legacy-claims decision
  remains open. Old Barcelona/Denver proposal links reach the general CFP application,
  not a verified historical call. No login, proposal or other business-data write was tested.
- [Release presentation](release-presentation-review.md) and [Swift inventory](swift-content-audit.md)
  document the seven release-banner / historical-map R2 migration and dedicated CMS
  release template. Live verification is in the vault handoff; Software navigation and
  production service/authentication acceptance remain separate.

These additions update repository evidence only. They do not overwrite or imply new staff
decisions in the shared worksheet, and no redirect destination was changed in this recheck.

### Sample-configuration historical link: Best Buy

Review page: https://astro.openstack.org/software/sample-configs/?release=ussuri#ecommerce

Historical Ussuri, Train, Stein, Rocky, Queens, Pike and Ocata Software sample data
link to https://www.openstack.org/user-stories/best-buy/ . On September15 this
redirected to https://www.openstack.org/use-cases/best-buy and rendered404. No
matching story was found in the imported case-study collection. Decide whether to
remove this old related link or provide an approved archived replacement. The
service-owned snapshot is unchanged; the internal-link audit retains this finding.
