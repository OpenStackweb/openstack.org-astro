# Git CMS evaluation

September 12, 2026. No replacement selected. JP requires a Git workflow; Decap and Keystatic are not constraints. The development team reports concerns with both. This is an evaluation, not implementation verification.

## Non-negotiable acceptance exercise

Use the real homepage, a software release announcement, navigation, and a structured summit page. Editors must be able to add, edit, reorder and remove nested content without deleting unexposed fields. Save into a branch, inspect a readable diff, open a protected preview at that revision, request review, merge/publish and revert. Retain direct developer edits in Git. Confirm that UI status reflects completed deployments, not just successful commits.

R2 remains the large-media source. Evaluate picking/uploading approved objects, access permissions, versioned keys, inline PDFs and avoiding binary archives in Git. Software/Marketplace API data stays owned by those services, regardless of editor.

## Shortlist to test

| Candidate | Reason to evaluate | Questions requiring proof |
| --- | --- | --- |
| Pages CMS | GitHub files/collections and declarative configuration; potentially a small operational footprint | Nested fields, protected draft previews, approval UX, external R2 media and permissions |
| CloudCannon | Astro support, visual editing and branch publishing aimed at editorial teams | Commercial terms, external Cloudflare hosting/preview integration, staff access and R2 integration |
| TinaCMS | Visual editing, schema-driven Git content and documented Astro/Cloudflare deployment | Operational complexity, hosted versus self-hosted requirements, existing JSON round-trips and preview isolation |
| Keystatic | Astro integration, code-defined schemas and GitHub branch UI | Existing nested JSON preservation, draft workflow, current Astro/Workers compatibility, repository write access for editors |
| Decap | Existing beta publishing flow and configuration provide a baseline | Specific maintenance/support concerns, outstanding issues, whether editorial UX is adequate |

Recommendation: compare Pages CMS for simplicity and CloudCannon for staff workflow first, with Tina as a visual-editing alternative. Keep Decap as the working baseline while measuring actual tasks. This ranking is provisional; no paid service or CMS migration is authorized by this document.

## Maintenance evidence

GitHub metadata checked September 12: Decap repository is not archived; latest reported release is `decap-cms@3.16.1`, published September 8, 2026, and repository push activity September 11. That contradicts an absolute claim of inactivity, but does not establish responsive support, sufficient maintainer capacity or resolution of this team's issues. Ask which issues motivate the concern before discounting it.

## Primary sources

- [Decap release](https://github.com/decaporg/decap-cms/releases/tag/decap-cms%403.16.1)
- [Keystatic GitHub mode](https://keystatic.com/docs/github-mode): repository write access and GitHub app configuration.
- [Keystatic Astro integration](https://keystatic.com/docs/installation-astro)
- [Pages CMS collections and files](https://pagescms.org/docs/configuration/content/)
- [Pages CMS storage model](https://pagescms.org/docs/development/database/): GitHub remains content authority.
- [CloudCannon Astro](https://cloudcannon.com/astro-cms/)
- [CloudCannon publishing](https://cloudcannon.com/documentation/user-articles/introduction-to-syncing-and-publishing/)
- [Tina Cloudflare Workers](https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers)

## Authorized proof — September 12 follow-up

JP selected a one-page Tina proof with media, and created/connected a TinaCloud project. See [Tina proof](tina-proof.md). This supersedes the provisional testing order above, not the final CMS decision. R2 browsing/upload is an acceptance gate before expanding schemas.
