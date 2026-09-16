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
