# Isolated Cloudflare deployment

- Host: `astro.openstack.org`
- Worker: `openstack-org-astro`
- Account: `2f794481bbde50a491af00a5766012a7`
- Access application: `OpenStack Astro review`, `afc1e887-15e3-408a-afc1-b641876d3a09`
- Shared Access policy: `OpenStack beta approved reviewers`, `03ea93d7-47e0-4417-90cd-811962367e74`
- Session duration: six hours. Email-code login is available for existing allowed reviewers, including openinfra.org and tipit.net domains.
- R2: `openstack-org-beta-media`, binding `MEDIA`
- No workers.dev or version preview URLs; no SilverStripe or SvelteKit proxy.

## Routine release

For Tina field/schema changes, run `npm run cms:schema` and commit the regenerated `tina/tina-lock.json` with the schema. `tinacms build` does not regenerate this lock. Keep the normal hosted schema check enabled.

1. Use Node 24. Run `npm ci`, `npm run check`, `node --test scripts/tests/*.test.mjs`, and `npm run build` with the configured CMS environment.
2. Review the diff for unrelated changes and credentials.
3. Publish approved work to `main` (staff content goes through Tina's draft branch/PR workflow). `Publish Astro review site` runs checks, the hosted Tina build and guarded deployment automatically. Watch both publishing and validation finish successfully.
4. In the authenticated review browser, verify affected content, CMS previews, application interactions, media and mobile layout. Anonymous visitors must still receive the Access challenge.

For a deliberate local deployment, activate this checkout's `openinfra` Wrangler profile and verify the OpenInfra account, then use `npm run deploy`. Routine CI deployment does not need a second local deployment. The deploy guard fixes the Worker/account/R2 identity and verifies anonymous Access challenges.

Staff draft previews use a separate editorial Worker with Access-protected version URLs. Dispatch the exact branch/SHA workflow as documented in [staff publishing](tina-branch-preview-plan.md#staff-publishing-steps). The main Worker's workers.dev and version preview URLs remain disabled.

Custom-domain attachment was performed once, after creating the separate Access application. Regular deployments contain no route mutations. Do not attach www.openstack.org or alter beta.openstack.org. Removing this comparison requires only its own Worker/domain/Access application; the shared reviewer policy and R2 bucket must remain.

Cloudflare's standard Wrangler OAuth token can deploy here but did not grant Access app detail access (HTTP403). The authenticated dashboard was used to create the new Access application with the existing policy. No existing Access app or policy was edited.

The adapter uses `cloudflare:workers` bindings and the generated `dist/server/wrangler.json`. Sessions and automatic Cloudflare Images bindings are disabled because this build does not use those features. R2 files retain their approved MIME/disposition and conditional/range response behavior.

## Current integration state — September 17

Tina branch-and-PR publishing is enabled with `main` protected in Tina. This does not establish GitHub branch protection. The isolated workflow trial passed branch creation, commit, PR, R2 media, protected preview and merge/restoration; a subsequent Marketplace category draft save also passed and its test PR was closed unmerged. See [Tina workflow evidence and staff steps](tina-branch-preview-plan.md) and [editor coverage](tina-proof.md) for scope and limits.

Visitor login callbacks are configured for Astro and the development OpenInfraID client. Login, account display and logout have been verified; this is not production service or Marketplace write authorization acceptance. See [authentication port](astro-authentication-port.md).

CI uses repository secrets `CLOUDFLARE_API_TOKEN` and `TINA_TOKEN`, plus `PUBLIC_TINA_CLIENT_ID` as a repository variable. The editorial preview uploader also uses the Access-management token; the protected resolver uses the Worker secret `EDITORIAL_GITHUB_TOKEN`. Never copy a short-lived local OAuth session into CI.

The September 13 direct-save workflow has been superseded by the branch-and-PR policy. Merging approved content to main still triggers the serialized publishing workflow. Failed checks leave the last deployed version in place.

### GitHub Actions runtime maintenance — September 15, 2026

The Learn deployment emitted a Node20 action-runtime deprecation warning even though application builds already select Node24. Updated all three Astro workflows to the current stable `actions/checkout@v7.0.1` and `actions/setup-node@v7.0.0` releases; each release's `action.yml` declares `node24`. Existing triggers, permissions, caches, application Node24 selection and protected deployment destinations are unchanged. The editorial workflow remains manual-only.

Sources: [checkout release](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node release](https://github.com/actions/setup-node/releases/tag/v7.0.0). Checkout v7's default protection for fork code under privileged triggers remains enabled; these workflows do not use those triggers. The newer credential storage continues supporting the editorial workflow's authenticated same-repository fetch. Acceptance requires actual main validation/publish and an exact-revision editorial workflow run, not a local app build alone.

### Review-page cache policy

Worker-rendered HTML without an explicit policy uses `Cache-Control: private,
no-cache`: browsers must revalidate before reuse and shared caches must not store
these protected pages. Existing endpoint policies (notably authentication and CMS
`no-store` responses), R2 media and hashed build assets retain their own policies.
This follows [HTTP caching guidance](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
for mutable HTML without disabling hashed-asset caching.

September17 checks found no Cache-Control, ETag, Last-Modified, Age or CF-Cache-Status
on the homepage/training HTML before this policy; `/admin/` already had no-store.
Two immediate post-deploy browser checks briefly saw old markup, then fresh and
ordinary URLs both served the new build. That observation does not distinguish
browser reuse from deployment propagation. A successful deployment job alone is
not hosted acceptance: verify the ordinary URL's actual changed content after it
finishes. The new policy does not purge responses stored before its deployment.
