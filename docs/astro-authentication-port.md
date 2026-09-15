# Astro shared authentication port

Source review: Astro `218a935`; SvelteKit `032a17650b000ada14af6e1704d7faf16334c887`. This is an implementation plan and current-state assessment, not enabled authentication or a production identity certification.

## Current state

- At the source review above, Astro's `src/lib/auth/session.mjs` was byte-identical to the SvelteKit coordinator; the follow-up correction below now intentionally differs. It serializes refreshes using an injected lock, retains the UICore-compatible `authInfo` shape, and uses an epoch to prevent an in-flight refresh restoring a signed-out session. Existing focused tests cover shared refresh, sign-out during refresh and permanent versus transient refresh failures.
- Astro also carries the same `config.js` and client module, but these are not imported by its pages, header or Software island. The header still points to the authentication notice. There are no Astro `/auth/*` pages.
- The copied client explicitly permits only `https://beta.openstack.org`; callback and logout URLs target beta. It must not simply be activated on Astro.
- Current copied public client ID is `dE73lGJBmKDSka1nhz6W~d2HG.6T6ImB.openstack.client`, authority `https://id.openinfra.dev`. This differs from client IDs discussed earlier in the migration. Use the reviewed source as evidence of the current beta configuration, not proof of which registration is approved for Astro.
- The current Software React island consumes catalogue snapshots and public props. It has no auth-service prop or authenticated request. A signed-in header alone would therefore not prove Software service integration. Development API identity/data remain a separate gate.
- Cloudflare Access and TinaCloud editor login are independent of visitor OpenInfraID authentication. Neither establishes a visitor session.

## Port contract

| Surface | Implementation | Acceptance |
| --- | --- | --- |
| Configuration | Explicit Astro origin, issuer, public client ID, endpoint metadata and scopes. Avoid falling back to beta callback URLs. | Confirm registered origin/redirect/logout URLs and provider metadata before enabling. |
| Login | Native Astro `/auth/login` page calls the framework-neutral PKCE client. | State, nonce and return destination validated; query/token details never rendered in errors. |
| Callback | Native `/auth/callback` page processes the response then clears callback parameters and returns to a validated local URL. Use no-referrer and no-store. | Successful login, denied consent, missing/stale state, reused code and session-storage failure. |
| Header | A small browser controller subscribes to the shared auth service; render identity with textContent, not HTML interpolation. | Initial anonymous state, login, refresh, tab visibility, navigation and accessible error state. |
| Logout | `/auth/signout` clears local session before provider logout; `/auth/logout` validates provider response. | Failed provider connection still leaves local session cleared; in-flight refresh cannot resurrect it. |
| Feature apps | Pass the same session/access-token interface into authenticated app features when those are connected. Apps must not start independent refresh loops. | One refresh across shell/app; correct service audience/scope; 401 expiry and 403 authorization handled distinctly. |
| Profiles | Connect a confirmed profile service or show the existing deferred-workflow notice. | Do not revive SilverStripe proxy login to make the header appear complete. |

Proposed registration for the Astro host, following the existing route contract:

- Redirect: `https://astro.openstack.org/auth/callback`
- Post-logout redirect: `https://astro.openstack.org/auth/logout`
- Browser origin: `https://astro.openstack.org`

These are planned values, not a claim that routes or provider registrations already exist. No registration/settings changes were made during this review.

## Boundaries and remaining evidence

Browser storage is origin-scoped: beta and Astro do not share localStorage. Within a host, the shell and React islands can share one coordinator. Across project domains, reuse the identity provider's SSO through an authorization round trip, rather than copying tokens across domains. The existing coordinator alone does not certify that flow.

A read-only attempt to retrieve the authority's discovery document on September14 returned HTTP403; the web tool also could not open it. This does not prove the provider is down, but current endpoint/CORS behavior was not revalidated. Obtain successful discovery/authorized browser evidence before enabling the port. No user tokens or private profile data were retrieved.

Production API datasets, scopes/audience and the chosen client registration must be confirmed together. Keep visitor login visibly pending until the complete host-specific flow is implemented and verified. Service data, account creation and profile mutations remain outside this read-only assessment.

## Fresh-sign-in race corrected before activation

A deterministic two-consumer regression test reproduced a missing generation change: while tab A refreshed an expired session, a new sign-in saved by tab B could be overwritten by A's late successful response. A late `invalid_grant` could also clear the new session. A fresh sign-in now advances the shared epoch after response validation; refresh saves retain their generation. Existing refresh and logout protections still pass.

The test fails against the prior Astro implementation and passes after correction, including both successful and rejected old refresh responses; all96 tests pass. This uses injected synthetic storage/refresh responses and makes no IDP requests. Astro login remains inactive. The separately reviewed SvelteKit baseline contains the earlier pattern and was not modified by this Astro change. This race is distinct from the verified TinaCMS stale-save overwrite, which remains unresolved.
