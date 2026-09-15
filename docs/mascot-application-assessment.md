# Project mascot downloads — service and editorial boundaries

Reviewed September 15, 2026. SilverStripe source: OpenStackweb/openstack-org
`2172298743fe807a92758cf307059b69a7dba668`. Software API source:
`88616d261949584535f9deffe773a96d7abf8f9b`. This is source and public-browser
evidence, not a certification of the deployed API dataset.

## Existing behavior

`AboutMascots_Controller::processMascots` reads `Mascot` records and lists each
project's mapped Swift directory, caching file listings for 24 hours. The page
sorts by project code name. The template contains editorial introduction, three
selected YouTube videos and FAQs. It distinguishes downloadable packages from
mascots in progress or not chosen. These states should survive migration.

`about-mascots.js` opens a package modal with individual downloads and Copy Code
buttons. Raster files produce image embed code; EPS files produce download-link
code. EPS previews use a shared thumbnail. The reviewed page controller does not
implement a signing or authenticated download gate. Its analytics wrapper is not
a requirement to recreate legacy tracking.

The public page exposed 69 downloadable project packages and 750 file entries.
See [the DOM inventory](mascot-package-audit.json). One browser sample, Barbican,
opened ten downloads and ten Copy Code controls, with EPS/JPG/PNG variants.
No clipboard write was performed. Counts do not prove that every file can be
downloaded, is unique, is correct or has already been migrated to R2.

## Software API already owns mascot identity

The Django `Mascot` model has name, code_name, hide and one optional File relation.
Its OAuth-authenticated CRUD view and serializer support file expansion; File
exposes filename/content type/public URL. Django admin offers mascot editing and
the primary-image preview. The migration command `migrate_mascot_images` imports
one matching PNG per mascot; it does not migrate the download-package variants.
No migration command or service write was executed for this assessment.

Neither the reviewed legacy page query nor the service view explicitly filters
the hide flag. Confirm intended public visibility before reusing all API rows;
the existence of the flag does not prove that either deployed path enforces it.

## Recommendation for a decision

Keep project/mascot identity and the primary image owned by Software API. Keep
the introduction, selected videos and FAQs in Git/Tina. For the full download
library, assess extending the existing service with variant metadata and R2
object references; a reviewed Git package manifest keyed to service identity is
an alternative if staff intentionally prefer Git ownership for asset packages.
Do not create a second independently editable mascot directory in Tina or infer
750 package variants from a single image URL.

Before implementation, settle package ownership, visibility and whether Copy
Code remains useful. Reconcile published project records against the production
Software dataset, preserve in-progress/unselected states, selectively verify and
migrate referenced assets, and test accessible package navigation and downloads.
Historical FAQ contacts and licensing wording need Foundation editorial review;
the migration should not silently invent replacement policy. No new service
model, backend endpoint or public package implementation is authorized by this
assessment. The current Astro page remains an explicit review notice.
