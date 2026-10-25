# Review findings remediation — October 24, 2026

Source: OpenStackweb/openstack.org-astro, branch `fix/astro-review-findings`, based on readability PR #29 (reviewed base `d03f1ea`, with subsequent review corrections incorporated). This is a candidate update, not evidence of deployment.

## Dependency changes

- Tina 3.13.0 → 3.15.0 and CLI 2.7.0 → 4.0.3, with its matching app/schema packages. The [admin preview origin advisory](https://github.com/advisories/GHSA-x34j-47hf-4xg7) is patched. Regression tests exercise the installed preview-path normalizer and message-origin/window checks, render the installed PreviewInner component, and invoke the actual registered message callback with trusted and untrusted senders. App source resolves through the CLI dependency rather than a fixed node_modules path.
- Astro 7.3.2 → 7.4.2; sanitize-html 2.17.7 → 2.18.1; Wrangler 4.129.1 → 4.152.0 with compatible Workers types. Updated transitive packages within declared ranges. All direct dependency declarations now use exact versions.
- A version-range override replaces every dependency on vulnerable Undici 7.x (`>=7.0.0 <7.30.1`) with 7.30.1 across the dependency tree. Miniflare currently introduces the affected copy. Remove the override once all parents select patched versions; do not broaden it to other Undici major versions.
- Reviewed the Tina source patches against the installed 3.15 code. Tina now supplies the toggle input ID itself; our remaining patch hides the decorative label and preserves field/media accessibility. The list keyboard patch still applies. The new dependency tree uses React Final Form 6.5.9, which does not contain the faulty remount code patched in 7.0.1; removed that obsolete patch and retained both behavioral regression tests. A postinstall/build guard resolves Tina’s own React Final Form dependency and refuses major 7 or later pending explicit review.
- Tina's regenerated lock changes GraphQL generator version 2.4.11 → 4.0.1 and generated GraphQL definitions. A structured comparison confirms every collection definition is unchanged and the lookup is identical. The hosted build passed after TinaCloud indexed the candidate branch; cloud schema validation was not bypassed.

The audit dropped from **46 affected packages / 4 critical** to **20 affected packages / 0 critical** (14 high, 4 moderate, 2 low). Those 20 entries propagate four underlying advisories through the dependency tree. They are not 20 independently confirmed exploitable site defects, and zero critical entries is not a clean security audit.

## Remaining advisories and next action

| Dependency | Installed path and exposure evidence | Action still required |
| --- | --- | --- |
| [GraphQL Tools utils](https://github.com/advisories/GHSA-7mx3-vvmw-hjmv) | Old copies under Tina CLI's GraphQL file loader/import/load packages; schema/build tooling. The advisory concerns prototype pollution in mergeDeep. | Upgrade the parent GraphQL loader family together, or adopt an upstream backport after compatibility tests. A forced replacement of old utility majors with 12.x is not a verified fix for this stack. |
| [Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | Tina/app/schema-tools use Zod 3; Astro's separate Zod 4 copy is patched. Oversized constrained collections can consume excessive memory. | Tina needs compatible validation-library remediation. Assess editor/import payload paths and limits; do not assume replacing Zod 3 with 4 is API-compatible. Protected editor access is context, not a waiver. |
| [PostCSS selector parser](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | Old copies in Tina's Tailwind/PostCSS build chain; these process source CSS rather than public form input. | Update the parent build chain or validate a specific backport. The patched parser is in a newer major than these callers declare. |
| [KaTeX](https://github.com/advisories/GHSA-238p-pmpm-9mq7) | Tina → Mermaid → KaTeX. The advisory requires existing prototype pollution to bypass trust restrictions. | Validate the parent Mermaid/math-rendering upgrade, including editor preview behavior. No claim that this path is absent from the editor bundle. |

No `npm audit fix --force`, cross-major blanket overrides or advisory suppressions were used. `security:audit` reports the full audit and fails on critical findings in a separate audit job on pushes, PRs and a daily 08:17 UTC schedule. Code validation has no dependency on that job, so advisories and audit-registry failures cannot hide the type-check/test/build result. Scheduled runs audit the default branch and start only after this workflow is merged. Editorial preview and publishing workflows do not run a live audit, so old draft lockfiles, newly disclosed development-tool advisories and registry outages do not prevent urgent content previews/publications. No advisories are suppressed; validation remains visible to reviewers. The threshold is declared once in package.json.


## Industry template

Replaced the deeply nested diagram/quote/logo/split/card/story/topic ternary chain with separate, explicit section-kind branches and removed unnecessary fragment wrappers in that section. Existing CSS and content ownership remain intact. Each variant is independently readable; OptionalLink wraps the one shared image element only when a destination exists. Most of the remaining file is scoped CSS; a future CSS/component split is lower-priority maintainability work, not a security prerequisite.

Compared all 12 industry pages at 1440px and 390px: 24 comparisons had identical main-element content, links, image references, geometry and selected computed styles. Synthetic images were used on both sides because local R2 is empty. Screenshots were inspected; this is layout equivalence evidence, not verification of live R2 assets.

## Validation

256 Node tests pass after the review corrections, including installed Tina security guards and retained unsaved-edit/accessibility checks. Astro check has zero errors/warnings and four existing hints. Formatting and full hosted Tina/site build pass. Hosted schema validation initially rejected the old branch index, then passed against the candidate's regenerated lock without a skip flag. No hosted content was edited.

The local Tina browser test edited a heading, reordered publications by keyboard, saved, reloaded the persisted result, and restored the original content byte-for-byte. Final CI results are linked on the PR. #29 was merged as 921a1a2 and deployed successfully to the protected Astro site. This follow-up is based on main and remains unmerged. Release requires merging #30, then verifying the authenticated hosted editor after deployment.
