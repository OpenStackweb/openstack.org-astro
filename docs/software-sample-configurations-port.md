# Software sample configurations — Astro port

September 15, 2026. Base Astro revision `ea91104`. This restores an existing
SvelteKit feature in the selected Astro implementation; it does not establish
production Software service or identity parity.

## Ownership and source

- Existing SvelteKit `src/routes/software/sample-configs/+page.server.js` and
  `+page.svelte` define release selection, configuration categories, descriptions,
  service lists, related links and optional-service sorting.
- SilverStripe `software/templates/Layout/SoftwareHomePage_getSampleConfigurations.ss`
  at `2172298743fe807a92758cf307059b69a7dba668` reads the release's structured
  SampleConfigurationTypes and SampleConfigurations, not ordinary page content.
- Astro already bundled `sample-configurations.json`, `release-history.json` and
  `softwareCatalog`. These remain unchanged and service-owned, outside Tina.
- The new native Astro page sanitizes rich text through the existing renderer,
  validates service/related links, and uses a small browser script for category
  selection and sorting. Without JavaScript, all configurations remain readable.

## Verified locally

Full hosted-mode build passed; Astro check: 287 files, zero errors/warnings,
two existing importer deprecation hints. Built Worker browser checks:

- Default Dalmatian Compute Starter Kit, hash change to Big Data, and direct
  Web Applications hash select exactly one configuration.
- Newton `#ecommerce` selects its historical eCommerce record.
- Kilo displays the explicit empty state; unknown release returns HTTP404.
- Mobile Web Applications: 390px viewport/375px document, no overflow; screenshot
  inspected. Canonical retains the selected release.
- Optional service arrays are empty in all bundled snapshots. An isolated browser
  response fixture exercised the actual sorting script: 10/2/null descending and
  2/10/null ascending, with matching aria-sort and missing values last. This is
  synthetic behavior evidence, not production-data acceptance.

Production currently resolves `/software/sample-configs/` to
`#compute-starter-kit`; inspected its Software/Compute Starter Kit headings and
SilverStripe template. Exact production layout parity, all historical rich-text
links, curator presentation, and production dataset coverage remain open. The
page prominently labels development data and pending identity verification.
No service, database, production deployment or content snapshot was changed.

## Expanded media/link audit

The existing SEO/link/media audits now include the default sample page and every
bundled release query (28 additional source URLs). The first pass exposed twelve
unresolved asset paths and the old `/user-stories/best-buy/` link.

Nine exact published files were downloaded selectively: four PDFs and five JPEGs.
PDF metadata: Web Applications9 pages, Big Data9, eCommerce15, April2016 survey61;
none contain forms, JavaScript or encryption. First pages and three thumbnail
images were visually inspected. The reviewed manifests retain original bytes and
checksums. R2 uploads/downloads matched size and SHA256 for all nine files. Three
obsolete resampled JPEG URLs return404 on production and now alias the corresponding
available reviewed diagrams, documented in `software-sample-image-aliases.json`.

The shared rich-text renderer previously normalized anchor URLs but left image
URLs relative to the browser location. It now resolves image URLs against the
same explicit content base; sample data supplies `/`, matching SilverStripe's
root base. Regression checks cover root-relative and page-relative resolution,
external images and removal of executable image URLs/handlers. API snapshots stay
unchanged. Six content-accessibility tests and the full normal build passed.

The Best Buy production link redirects to `/use-cases/best-buy`, whose page is404.
No verified replacement exists in the imported case-study collection. Keep this
as an editorial review item, not an invented destination or a hidden audit finding.
The seven historical releases retaining that link are Ussuri through Ocata.

After the media fix, the local built-Worker pass inspected280sources: no source
errors or unresolved local asset references;1,222registry references,73public,
10build and133external references. Link audit:1,063targets, one known Best Buy404,
173notices,29external redirects,7fragment findings,11query redirects and one
asset/app redirect. SEO:1,281targets, zero inspection failures/per-route findings.
Reports record parent a0e5567; the media/renderer/audit changes described here were
present in the inspected worktree. Counts do not certify external destinations,
production indexing, or application functionality.
