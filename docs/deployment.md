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

1. Use Node 24. `npm ci`, `npm run check`, `npm run build`.
2. Review the diff and ensure there are no credentials or unrelated SvelteKit working-tree files.
3. Commit/push the reviewed change. GitHub runs validation; watch it complete.
4. For this checkout only: `npx wrangler auth activate openinfra .`. `npx wrangler whoami` must show the OpenInfra account. Never use a different project's default account.
5. Run `npm run deploy`. The script validates the exact Worker/account/R2 identity and confirms anonymous Access challenges before deployment.
6. In signed-in Chrome, check homepage, React filtering/detail routes, representative content, R2 image/PDF and mobile navigation. Anonymous requests must still be challenged.

Custom-domain attachment was performed once, after creating the separate Access application. Regular deployments contain no route mutations. Do not attach www.openstack.org or alter beta.openstack.org. Removing this comparison requires only its own Worker/domain/Access application; the shared reviewer policy and R2 bucket must remain.

Cloudflare's standard Wrangler OAuth token can deploy here but did not grant Access app detail access (HTTP403). The authenticated dashboard was used to create the new Access application with the existing policy. No existing Access app or policy was edited.

The adapter uses `cloudflare:workers` bindings and the generated `dist/server/wrangler.json`. Sessions and automatic Cloudflare Images bindings are disabled because this build does not use those features. R2 files retain their approved MIME/disposition and conditional/range response behavior.

## Remaining integration work

- Complete the Tina acceptance checks: hosted R2 uploads, repeated-item operations, publishing feedback and editorial review. Homepage and global announcement Git editing are connected; see the Tina publishing checkpoint below.
- Register this hostname's OpenStackID callbacks and agree dev/production identity and API data before enabling sign-in. Do not copy browser sessions between origins.
- Maintain the configured CI publishing workflow and monitor failed builds. Do not store a short-lived local OAuth session as a CI secret.

## Tina save publishing (September 13)

The Astro editor now saves to main. `Publish Astro review site` runs checks and builds with Tina credentials, then invokes the existing deployment guard. Runs are serialized and checkout current main when they start, so queued saves converge on the latest content. Only the Astro review Worker is targeted. Failed checks leave the last deployed version in place.

Repository configuration: `TINA_TOKEN` secret and `PUBLIC_TINA_CLIENT_ID` variable have been installed. `CLOUDFLARE_API_TOKEN` is now installed as a repository secret. Workflow34775196372 completed successfully on September13, including checks, Tina build, Access guards and deployment (Worker1725be2b-9c7a-4846-8604-2a312f303762, commit74ccc1f). Hosted content and the loaded homepage editor were verified in Chrome. Routine local Wrangler profile openinfra remains usable. See `docs/tina-proof.md` for editor coverage and test limits.
