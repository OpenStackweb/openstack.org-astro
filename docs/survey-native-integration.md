# Native Survey integration

October16,2026. Astro base main960bb03; Survey service746ea47. Existing dirty
search/YouTube/page-edits checkout was preserved; this change uses an isolated
worktree/branch. The target is the protected Astro review site, not www cutover.

## Ownership and routes

Astro /user-survey/ owns site layout and Tina-editable heading/introduction/resource
links. Survey's participant-only module mounts in the page without an iframe.
Django owns definitions, responses, revisions, copying, cloud teams and permissions.
Staff/history administration remains at the separate protected Survey workspace.
The old root redirect to an unaccepted2026 route is removed. Annual legacy paths,
FAQ, archived reports and analytics retain their existing behavior.

/user-survey/service forwards only participant endpoints, manifest/static assets,
OIDC sign-in/callback and logout. No generic arbitrary URL proxy, staff APIs,
historical exports or admin paths are exposed by the gateway. Every response is
private/no-store. Only Survey session/CSRF cookies cross the boundary; their paths
are narrowed to /user-survey/. Unrelated cookies, bearer credentials and browser
Access headers are not forwarded. State-changing calls need the exact browser
origin, retain their CSRF header and revision body, and are bounded to300kB.
Django independently verifies CSRF and object permissions. Unexpected redirects
fail closed. Missing credentials/outages produce a generic unavailable state;
no local auth bypass is enabled on the hosted route.

## Runtime configuration

Worker vars: SURVEY_SERVICE_ORIGIN=https://survey-staging.openstack.org.
Worker secrets: SURVEY_ACCESS_CLIENT_ID and SURVEY_ACCESS_CLIENT_SECRET, from an
application-specific Cloudflare Access Service Auth credential. These authenticate
the server transport only; they do not create or authorize Django users. Existing
Astro reviewer Access protection and the service's reviewer policy remain.
A loopback-only origin is accepted only in local Astro development for isolated
fixtures. The local /auth/local route is never enabled for the hosted service.

Survey env: SURVEY_EMBED_ORIGIN=https://astro.openstack.org, OIDC_ISSUER=
https://id.openinfra.dev, existing Astro public client ID, explicit
OIDC_TOKEN_ENDPOINT_AUTH_METHOD=none, OIDC_SCOPE=openid profile, and
OIDC_REDIRECT_URI=https://astro.openstack.org/user-survey/service/auth/callback.
There is no client secret in public PKCE mode. Confidential authentication remains
Survey's default. JP reported adding the callback to the existing OAuth app.
The existing Astro /auth/callback is preserved. Survey validates state, nonce,
issuer, audience, signature and expiry; it does not trust browser bearer tokens
or map private history by email. Ordinary login never grants staff permissions.

Reusing a client does not merge browser and Django sessions. Survey's embedded
sign-out ends its Survey session; global Astro login/logout/expiry coordination
still needs acceptance. No production callback/DNS change or questionnaire
publication is implied. All DNS changes remain manual by JP.

## Validation

- Astro check/build and full Node suite; gateway tests cover endpoint denial,
  credential/cookie isolation, CSRF/origin/revision forwarding, bounded bodies,
  redirects and outages.
- Actual local Tina save/edit/reorder/add/remove roundtrip restored source exactly.
- Survey Linux image,171 backend tests (20SQLite skips),55 migration/helper tests,
 22Node validator/date tests,25browser regressions, migrations/schema/runtime checks.
- Native Safari local preview used a disposable loopback-only service/database:
  login, start synthetic response, save through gateway and reload persistence.
  Shared header/footer render with scoped application CSS. Review caught and fixed
  removed module exports, duplicate H1 and epoch-second timestamp display.
- Remaining hosted acceptance: service credential/policy, coordinated backend and
  Astro publishing, real OpenInfraID roundtrip and two-account shared-session tests.

The independent Survey source repo is local-only; its SHA is recorded above. No
private data or historical archives are embedded in images or transferred for this
integration. Rehearsal fixtures must never be mistaken for published questionnaires.
