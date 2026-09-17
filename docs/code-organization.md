# Code organization and content ownership

Use the page's owner to choose where to change it. A record being rendered on a page does not make it CMS content.

| Area | Location | Responsibility |
| --- | --- | --- |
| Routes and response status | `src/pages/` | Select content/application modules and compose the site layout. |
| Shared page shell | `src/layouts/`, `src/components/Site*.astro` | Header, footer, navigation and document layout. |
| Readable editorial templates | `src/components/tina/` | HTML rendering and Tina field annotations. |
| Marketplace detail templates | `src/components/marketplace/` | Provider presentation; API values and shared editorial labels remain separate. |
| Git-managed copy | `src/lib/content/` | Page text, navigation, announcements and shared labels. |
| CMS field definitions | `tina/schema/` | Editor forms, field names and validation. Commit the regenerated Tina lock with schema changes. |
| CMS data adapters | `src/lib/tina/` | Pair committed content with schema-matched metadata for live editing. `document.ts` owns the common metadata builder; individual loaders choose content. |
| Interactive service features | `src/lib/software/`, `src/lib/marketplace/` | React islands, API projections, filters and feature styles. Generated catalogue JSON is not manually edited or registered as editorial content. |
| Server-side rendering and endpoints | `src/lib/server/`, `src/pages/api/` | Request handling, published asset access, content transforms and service boundaries. |
| Editorial link handling | `src/lib/content-links.mjs`, `src/lib/legacy-routes.js` | Allowed content-link protocols and internal route mapping, shared by inline text and cards. |
| Import and operational tooling | `scripts/` | Explicit imports, data audits, deployment guards and preview builds. Check a script's side effects before running it. |
| Evidence and operator guidance | `docs/` | Dated audits, provenance, open decisions and procedures. Generated audit JSON is evidence rather than application code. |

## Conventions

Keep Astro templates close to ordinary HTML. Extract a component when a named section is reused or has substantial behavior; do not turn every heading into an abstraction. Put data selection in frontmatter or a feature helper, leaving the markup easy to scan.

Keep service records in their API and editable wording in Git. For example, Marketplace's `tested` flag decides whether a qualification appears; Tina controls its label and explanation. Editing the explanation cannot qualify a provider or enable a disabled write operation.

Tina preview islands must render with the preview route's available renderers. The Marketplace uses pure Astro editorial sections around independent React islands, so copy edits do not recreate filters or maps. Do not nest React inside those editorial containers without adding and verifying renderer support.

Preserve established routes, content paths and Tina field names during cleanup. Their names are part of saved documents and editorial branch history. Move implementation helpers without gratuitously renaming persisted content. Keep provenance and historical audit records even when they no longer describe current behavior; mark superseded operational instructions clearly.
