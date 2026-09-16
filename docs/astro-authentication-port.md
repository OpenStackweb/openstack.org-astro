# Astro shared authentication port

Source review: Astro `218a935`; SvelteKit `032a17650b000ada14af6e1704d7faf16334c887`. This document contains dated implementation checkpoints. Visitor login was enabled on the protected Astro host on September 15; the September 16 checkpoint below records hosted happy-path acceptance, not production service certification.

## Current state

- At the source review above, Astro's `src/lib/auth/session.mjs` was byte-identical to the SvelteKit coordinator; the follow-up correction below now intentionally differs. It serializes refreshes using an injected lock, retains the UICore-compatible `authInfo` shape, and uses an epoch to prevent an in-flight refresh restoring a signed-out session. Existing focused tests cover shared refresh, sign-out during refresh and permanent versus transient refresh failures.
- Astro carries framework-neutral configuration and client modules. Four gated `/auth/*` routes and header controls are prepared (see the checkpoints below). Their runtime gate is now enabled only on astro.openstack.org; the header offers Log in. The Software island does not yet consume authenticated service data.
- At the initial source review, the copied client explicitly permitted only `https://beta.openstack.org`; callback and logout URLs target beta. It must not simply be activated on Astro.
- The initial copied public client ID was `dE73lGJBmKDSka1nhz6W~d2HG.6T6ImB.openstack.client`, authority `https://id.openinfra.dev`. This differs from client IDs discussed earlier in the migration. Use the reviewed source as evidence of the current beta configuration, not proof of which registration is approved for Astro.
- The current Software React island consumes catalogue snapshots and public props. It has no auth-service prop or authenticated request. A signed-in header alone would therefore not prove Software service integration. Development API identity/data remain a separate gate.
- The [Software service boundary](software-service-integration.md) traces its build-time service-account reads and provides an explicit read-only candidate checker; these are separate from visitor authentication.
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

JP confirmed these callback and post-logout URLs were registered on September 15. The enabled public client is the one referenced in that confirmation; provider administration was performed by JP.

## Boundaries and remaining evidence

Browser storage is origin-scoped: beta and Astro do not share localStorage. Within a host, the shell and React islands can share one coordinator. Across project domains, reuse the identity provider's SSO through an authorization round trip, rather than copying tokens across domains. The existing coordinator alone does not certify that flow.

A read-only attempt to retrieve the authority's discovery document on September14 returned HTTP403; the web tool also could not open it. This does not prove the provider is down, but current endpoint/CORS behavior was not revalidated. Obtain successful discovery/authorized browser evidence before enabling the port. No user tokens or private profile data were retrieved.

Production API datasets, scopes/audience and the chosen client registration must be confirmed together. Keep the remaining acceptance gaps visible in the demo guide until the complete host-specific flow is verified. Service data, account creation and profile mutations remain outside this read-only assessment.

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

## Identity notification race — September 15

Review of `a18db6e` found that `refreshIdentity` coalesced every request into the
currently pending promise, including notifications of a newer sign-in. The older
profile request correctly rejected its stale response, but the coordinator then
published an error and never loaded the newer identity. Session storage was safe;
the shell and app display could remain stale until another visibility/auth event.

A regression test against the real client module reproduced that error state.
The coordinator now tracks identity notifications, discards outdated results and
drains queued changes before settling the shared request. Forced token renewal
applies only once, so its own save notification does not trigger a renewal loop.
Sign-out also invalidates pending identity work before clearing storage.

Four synthetic response sequences cover a newer sign-in or sign-out while an old
profile request returns success or401. Two subscribers model the shell and app;
both finish with the current identity, without publishing the stale member or an
obsolete error. These tests use memory storage and intercepted fetches, not a real
IdP session. All132 repository tests pass. Visitor authentication remains inactive
until the approved client registration and hosted flow are verified.

## Gated route preparation — September 15

`src/pages/auth/[action].astro` now handles login, callback, signout and logout.
The server enables the client runner only when both runtime bindings are explicitly
configured: `VISITOR_AUTH_ENABLED=true` and `VISITOR_AUTH_CLIENT_ID` containing the
approved public client ID. `visitorAuthFor()` additionally requires the exact
`https://astro.openstack.org` origin. These bindings have not been enabled or added
to deployment configuration. Production, beta, local and editorial preview hosts
cannot activate the runner through those bindings.

Without configuration the routes show an explicit inactive message; unknown
actions return404. No client ID is rendered in the inactive state. Account pages
use a minimal standalone shell with no external resources, no-store responses and
no-referrer response/meta policies. Their script captures the callback URL once,
clears query/fragment parameters from browser history, and then processes the
captured URL. Errors display fixed text and a fresh-sign-in link, never provider
messages or callback parameters. The shared client's callback methods now accept
that captured URL; their default remains the current URL for existing callers.

Verification:20 focused tests pass, Astro check295files has zero errors/warnings
and two existing importer hints, and the normal hosted-Tina build passes. A local
built Worker returned200 for all four disabled routes and404 for an unknown
action, with the expected headers, removed query strings, absent client IDs and
no displayed synthetic authorization code. The mobile inactive page was visually
inspected at390px.

A separate browser context intercepted every request and supplied only local
built assets plus a synthetic public client marker. Login and logout callbacks
with unknown state displayed the fixed failure UI, cleared parameters and made
zero provider requests. Mobile document width equaled the390px viewport. This is
an isolated error-path test; it does not establish successful IdP login, code
exchange, logout, consent, storage failure recovery or real session sharing.

Remaining activation work at this checkpoint: approved registration, header/session controls, actual
callback acceptance, and the authenticated Software service contract. Do not
enable the runtime flag merely because these preparatory checks pass.

## Shared header controls prepared — September 15

`AccountControls.astro` uses the same exact-host/runtime gate as the account
routes. With the gate disabled it preserves the pending-login link. When enabled,
its custom element initializes the shared client once and subscribes to checking,
anonymous, authenticated and error states. The account dropdown offers logout,
retry and a visibly pending profile workflow. Names are assigned using textContent.
Login links preserve a validated local return path. Disconnect/remount cleanup
removes subscriptions and listeners, including after an asynchronous import.

The shared refresh handler now catches unavailable browser storage and publishes
a fixed error instead of leaving an unhandled background rejection. No real
identity/profile request was made: browser fixtures used an isolated context,
synthetic localStorage and intercepted local build assets/profile responses.

Verified in that fixture:

- Anonymous login and synthetic authenticated identity; HTML-like names remain
  text without injected elements.
- Profile403 retains the session, and keyboard Retry recovers after a200 response.
- Two subscribers reuse one cached identity without an additional profile request;
  removing/reinserting the account element restores its state.
- Profile401 clears the session and closes/hides the account dropdown.
- Blocked localStorage shows the controlled error with no unhandled page errors.
- Mobile390px/document375px, expanded menu and account actions visually inspected.

Initial browser assertions stalled because the automation runner's cross-cell
primitive bindings did not update the response closure. A shared mutable fixture
object resolved that test issue; those failed attempts are not product evidence.
An automation timeout reset the browser runtime; its process was confirmed gone
before reopening the authorized persistent review profile. All synthetic contexts
were closed after the checks.

All135 repository tests pass. Astro check296files reports zero errors/warnings
and two existing hints. These checks prepare the shell interface; they do not
establish real IdP login, account/profile editing, service audience/scope correctness
or authenticated Software/Marketplace behavior. Runtime authentication is still
disabled pending the approved registration and end-to-end acceptance.

## September 15 activation

JP confirmed registration of the Astro callback and post-logout URLs for the referenced public OpenInfraID client. The main protected Astro Worker now opts into visitor login through committed public runtime variables. Editorial Worker preparation strips both identity variables; exact-origin checks additionally restrict activation to astro.openstack.org. Cloudflare Access remains enabled. Real login, refresh, logout, and member API acceptance must be recorded separately from configuration/build success.

Hosted activation acceptance: deployment 2d6ff2d passed both Publish and Validate. The header shows Log in and the login route reaches the OpenInfraID sign-in page without a displayed provider error. A human sign-in is still required to verify the callback, member lookup, refresh and logout.

## September 16 — real hosted account acceptance

Against deployment 59b0ac7, JP completed provider sign-in. The browser returned to Astro with authorization query parameters cleared, a populated account header, and no account error. Navigation to Software and a second Community tab retained signed-in state. The member endpoint `/api/v1/members/me` at oifapi.openinfra.dev returned HTTP 200. Calling the deployed shared auth service refresh operation produced an OAuth token response 200 and a subsequent member lookup 200, with the account still displayed. No tokens or profile payloads were recorded.

Keyboard opening of the account menu and its Log out link completed provider sign-out through `/auth/logout`, returning to `/`. Local session/profile storage were absent afterward; both Astro tabs displayed anonymous Log in and hid the account menu. The test intentionally leaves the review browser signed out of visitor identity; Cloudflare Access remains authenticated.

This closes the real happy-path login/member/renewal/logout prerequisite. Denied consent, real expiry timing, production service scopes/datasets, profile editing and authenticated Software/Marketplace features remain separate acceptance requirements. The catalogue currently reads a public snapshot; a shared signed-in header does not certify authenticated catalogue operations.
