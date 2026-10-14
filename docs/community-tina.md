# Community editorial editing

October 9, 2026; local implementation on restored `main` base `99ffaab`.

The Community contributor portal and Supporting Organizations pages now have
dedicated Tina collections and Astro visual-editing islands. Access the running
local editor at `http://127.0.0.1:4390/admin/index.html#/~/community/` or
`http://127.0.0.1:4390/admin/index.html#/~/community/supporting-organizations/`.

`community.json` and `supporting-organizations.json` store editorial content.
Astro components control layout and interactions. Editors can update headings,
copy, images, links, interface labels, list order and record selections. Member,
project and company dropdowns use reviewed service snapshots; profiles, logos,
membership tiers and project details remain outside editorial ownership. Organization
profile/detail pages remain service-owned and do not become independent Tina pages.

Tina exposes numeric references as `projectId`, `memberId` or `companyId`, saving
the original JSON `id` fields through `nameOverride`. Renderers accept either
shape. Before-submit validation checks references, duplicates, panel types and
safe links/images. Cleared lists render empty. Layout and service-refresh work
remain engineering changes.

Local setup uses Node 24 and `npm ci`, then `npm run cms:dev`. In an agent environment
where Astro auto-backgrounds, use `ASTRO_DEV_BACKGROUND=1 npm run cms:dev` to keep
Astro attached to Tina; otherwise the parent command exits and shuts down local Tina.
The media picker retains the existing R2 integration and needs its normal auth and
storage setup; this change does not verify uploads on the fresh machine.
The fresh local R2 bucket has no imported mascot objects: those requests return
503 and use the existing OpenStack-logo fallback. Hosted/shared R2 delivery must
be reconnected or local objects populated before treating this as asset parity.

Validation: `npm run cms:schema`, `npm run check`, a full credential-free site build,
schema coverage tests, reference/empty-list tests and `scripts/check-community-preview.mjs`.
Preview overlays test both pages, escaped headings, add/reorder/remove and restoration
of committed content. Safari local-mode headline save preserved all original fields
and numeric identifiers; the headline was restored. The loopback-only
`scripts/check-community-save.mjs` also saved addition/reordering/removal through
Tina's actual GraphQL backend for both collections, verified every editable field
and original `id` storage, and restored the JSON files byte-for-byte. Safari visitor
layouts were inspected at desktop and narrow widths (using window resizing and
page zoom); Community contribution buttons open their panels. Hosted Tina branch indexing,
media upload and deployed acceptance are still pending. No push/deployment occurred.

Never expose local Tina port 4001 or its write-capable editor through a public
preview tunnel. Use a separate website review process and the existing hosted
branch/PR workflow for remote editing.
