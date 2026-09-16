# Astro shared authentication port

Source review: Astro `218a935`; SvelteKit `032a17650b000ada14af6e1704d7faf16334c887`. This is an implementation plan and current-state assessment, not enabled authentication or a production identity certification.

## Current state

- At the source review above, Astro's `src/lib/auth/session.mjs` was byte-identical to the SvelteKit coordinator; the follow-up correction below now intentionally differs. It serializes refreshes using an injected lock, retains the UICore-compatible `authInfo` shape, and uses an epoch to prevent an in-flight refresh restoring a signed-out session. Existing focused tests cover shared refresh, sign-out during refresh and permanent versus transient refresh failures.
- Astro carries framework-neutral configuration and client modules, but these are not imported by its pages, header or Software island. The header still points to the authentication notice. There are no Astro `/auth/*` pages.
- At the initial source review, the copied client explicitly permitted only `https://beta.openstack.org`; callback and logout URLs target beta. It must not simply be activated on Astro.
- The initial copied public client ID was `dE73lGJBmKDSka1nhz6W~d2HG.6T6ImB.openstack.client`, authority `https://id.openinfra.dev`. This differs from client IDs discussed earlier in the migration. Use the reviewed source as evidence of the current beta configuration, not proof of which registration is approved for Astro.
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


## Profile-response race corrected before activation — September 15

Reviewed Astro `6021fa7`. The copied member-profile request cleared the session
on HTTP401 before checking its generation. A delayed response for a previous
sign-in could therefore clear a newer sign-in. A same-session token refresh also
needed protection: the generation remains unchanged while its access token changes.

The framework-neutral `member-profile.mjs` now checks both generation and current
token after token acquisition, before interpreting the HTTP response, and after
JSON decoding. Only a401 for the still-current request clears that session.
A403 retains it; returned identity remains limited to display name and member ID.
The existing client delegates to this helper without changing endpoint or enabling
login. No credentials, discovery request or profile mutation were used.

Seven simulated regression cases cover newer sign-in, refreshed token, sign-out,
current401, session change during JSON decoding, empty-name fallback and403.
Removing the pre-response guard in an in-memory copy reproduces the newer-session
clearing defect. All112 tests pass; Astro check266files reports zero errors,
zero warnings and two existing importer deprecation hints. This is unit/source
acceptance, not hosted authentication acceptance. Confirm host registration,
service endpoint/scopes and full shell/app state behavior before activation.

Normal hosted-mode TinaCloud/Astro build also passed after the change. The auth modules remain inactive on public pages; this does not establish an enabled browser login flow.


## Explicit Astro configuration preparation — September 15

The copied beta client ID and callback defaults have now been removed from Astro.
The unused client must be initialized with
`configureAuth({ origin: location.origin, clientId: approvedPublicClientId })`
before the shell or feature apps subscribe. Configuration accepts only the exact
Astro review origin, derives its callback/logout URLs, and rejects empty or
malformed public client IDs. Repeated initialization shares the same coordinator;
switching client IDs requires a page reload. Session operations check the actual
browser origin, and unconfigured subscription/login/profile/clear operations fail
before touching browser storage or the network.

This is preparation only. No pages import or initialize the client, no auth routes
or active header login were added, and no client registration is assumed. The
public client ID still requires user confirmation. The existing beta registration
and implementation remain unchanged.

Read-only discovery retrieval succeeded on September15 with the same issuer,
authorization, token and logout endpoints. A request carrying the Astro Origin
header returned no Access-Control-Allow-Origin. Therefore fixed endpoint metadata
remains appropriate; API retrieval alone does not prove browser CORS/token exchange.
The discovery document does not advertise PKCE methods. Existing PKCE behavior
still needs acceptance against the approved client; no sign-in or token request
was made in this preparation.

Seventeen synthetic configuration, session and member-profile tests pass. They cover
exact-origin/public-client validation, absence of beta defaults, initialization
identity, forbidden client switching, disabled operations and local return paths,
alongside the existing session/profile race tests. The installed OIDC library also constructs a synthetic authorization request with the Astro callback, S256 challenge, nonce and in-memory state using fixed metadata; it does not navigate to the provider or exchange a code. This is not a hosted login test.
