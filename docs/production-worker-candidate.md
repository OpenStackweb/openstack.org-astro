# Separate production Worker candidate

This prepares a www-origin build and an unroutable Worker configuration. It does
not upload a Worker, enable public URLs, attach hostnames, edit Access/DNS or
approve cutover. The proposed Worker name is `openstack-org-production`; it has
not been created by this work. Review/public indexing and complete service/CMS
acceptance remain separate gates.

## Build and target separation

Normal `npm run build` remains a review build with Astro site origin
`https://astro.openstack.org`. An explicit production build uses:

```sh
OPENSTACK_BUILD_PROFILE=production npm run build
node scripts/prepare-production-candidate.mjs
```

The production profile sets Astro's framework site origin to the existing
canonical identity `https://www.openstack.org`. No editorial fields, canonical
alias rules or page content are changed. After a successful build, a record in
`dist/site-build-profile.json` binds the profile/origin to hashes of the compiled
client/server file registry. This includes the generated manifest/chunks, not
just the entrypoint. The two derived target configs are excluded from this base
fingerprint and validated through their own preparers.

The default review deploy command and editorial preparation/upload require the
review profile and unchanged output. A www build cannot pass that path. A rejected
build profile clears the previous build record and production candidate before
patch/build steps. Unknown profiles, stale records and altered/missing/extra
compiled files fail closed.

The production preparer writes only `dist/server/wrangler.production.json`, beside
Astro's generated config so relative module/asset paths remain valid. It removes
any previous candidate before validation. A review build cannot be repurposed by
renaming its Worker. There is no production upload command or workflow here.

## Candidate capabilities

The generated candidate has both public URL types disabled, an empty route list
and no cron triggers. It retains only the reviewed MEDIA bucket/module packaging,
production role and approved public Tina/visitor registration IDs when present.
Visitor activation is explicitly false. Staging Survey origins, service/queue
bindings, local authorization flags and private credentials are not inherited.
Unexpected runtime variables are refused. The generated source config is unchanged.

The public Tina project ID preserves existing project wiring when a hosted editor
is built. It is not CMS production acceptance: www origins, staff permissions,
branch/PR workflow and private integration credentials require their own review.
A local build without Tina credentials has no editor UI and cannot certify it.
Keep [the production identity packet](production-identity-registration.md) and
paired Survey configuration gates in the release plan.

All indexing controls deliberately retain their current policy: robots disallow,
HTML/response noindex and private media caching/indexing behavior. The offline
sitemap remains unserved/unapproved. This candidate therefore cannot be used as
a public launch artifact without the coordinated indexing/route policy and
remaining functional/data/operations acceptance.

A future accepted release must select immutable build identities, verify actual
production origins/rollback, install separately reviewed secrets/service bindings,
complete a protected production-origin rehearsal, and obtain cutover authorization.
JP performs DNS changes manually. Do not point `npm run deploy` at this candidate
or use a review deployment as a shortcut to launch.

## Local acceptance, October 17

The [acceptance record](production-worker-acceptance-2026-10-17.json) records
241 passing Node tests, clean Astro checks, successful builds of both profiles,
and seven HTTP checks on the prepared production config. The compiled manifest
uses www in production and astro in the default review build. Actual review
deploy/editorial preparation reject the production build; production preparation
rejects the review build. No Worker was uploaded.

For local rehearsals, use Wrangler `--persist-to` outside `dist`: local state
inside compiled output correctly invalidates the build fingerprint. Stop the
local process before moving its state. Never rewrite a stamp to accept changes.
