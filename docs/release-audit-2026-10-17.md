# Release candidate audit — October 17, 2026

This refresh replaces dated local audit evidence with checks against the current
candidate application source. It does not approve a production cutover or replace
browser, editorial, CMS, application or staff acceptance.

The Worker was built from cf6154a1684231d59556bc13f7245b0092ab791b with Node24.21.0.
The later audit-tool revision d8b869f changes only the route assertion and its
helper/tests; runtime inputs are unchanged. Artifact hashes and exact scope are
recorded in [the acceptance manifest](release-audit-2026-10-17.json).
The local build had no hosted Tina credentials; hosted editor acceptance is a
separate check. Production routing, Access and all preview noindex controls remain
unchanged. No browser visual or keyboard acceptance was performed.

| Check | Observed result | Boundary |
| --- | --- | --- |
| Rendered metadata | 1,399 route/query targets, no inspection failures or findings | Includes title, canonical, locale/social metadata, WebPage JSON-LD and preview noindex; image delivery and public crawler access are unverified |
| Internal links | 299 sources, 1,071 targets, no source errors or internal HTTP errors | 127 notice targets, 45 external redirects, 14 query redirects and one asset/application redirect still need their respective acceptance |
| Static accessibility candidates | 253 pages, no findings | HTML-only checks do not establish accessible-name correctness, keyboard behavior, contrast or responsive layout |
| Asset references | 299 sources, 12 stylesheets, no source errors or unresolved local references | 1,173 R2 registry references, 72 public files, 11 build files and 142 external references; registry presence does not prove stored bytes or delivery |
| Fixed route inventory | 515 paths: 174 redirects, 288 rendered but unverified, 53 notices; no HTTP errors | This inventory is not every dynamic route and its classifications are not functional completion |
| Detailed route checks | All 238 editorial records, configured redirects in both slash forms, selected landings, Software SSR, translated paper HTML/PDF aliases, company profiles and unknown-route404 pass | Existing service snapshots and notices remain distinct launch gates |
| Use Cases SSR | Exact identities of all 72 visible stories match; two CMS-selected exclusions are absent | No story records or visibility choices were changed |
| Offline sitemap | 284 unique canonical candidates, 1,113 held audit rows | Not served, submitted or approved for indexing |

The six fragment findings are the existing Marketing tab-state URLs. They are not
literal server HTML IDs; their earlier browser acceptance is recorded in
[the legacy link review](legacy-link-review-2026-09-17.md). This refresh does not
repeat that browser check.

The sitemap adds the already implemented Hibiscus release announcement. The
previous 283 candidates remain. XML parsing and the legacy crawler's standalone
loc extraction both return the exact same ordered 284 URLs. No source dates were
invented. This does not certify a fresh Software catalogue or deployed search index.

All six broad audit entrypoints now verify the local Astro identity and disabled
legacy proxy with a root HEAD request before reading routes. Requests remain on
that verified origin, use only GET/HEAD and never follow redirects. A loopback port
alone is insufficient evidence that a legacy proxy is absent. Four regressions
cover that boundary. Four more verify exact visible story IDs, including duplicate,
missing and incorrectly visible hidden cards. The old hardcoded 74-card assertion
was stale after the approved October14 exclusions; it was not a rendering defect.

Validation: all 226 Node tests pass; Astro check has zero errors/warnings and four
hints; the full build passes. No page content, CMS schema, data ownership, service
bindings or deployed configuration changed in this audit work.

Remaining production preparation includes a separate public Worker configuration,
coordinated robots/HTML/header/media policy and served sitemap from an approved
registry, actual origin/rollback values, complete service/data acceptance and a
protected production-configuration rehearsal. See [cutover preparation](production-cutover.md).
