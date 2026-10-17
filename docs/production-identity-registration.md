# Production identity preparation

Status: candidate configuration only. No IDP registration or deployed binding was
changed. This does not authorize production cutover or certify browser acceptance.

The existing canonical site identity is `https://www.openstack.org`. The candidate
visitor configuration supports that exact origin only with explicit
`SITE_DEPLOYMENT=production`, `VISITOR_AUTH_ENABLED=true` and a valid approved
`VISITOR_AUTH_CLIENT_ID`. Without a deployment value, existing configuration
remains restricted to `https://astro.openstack.org`. Unknown deployment values,
other hosts, HTTP, beta and editorial preview hosts cannot activate visitor login.
The apex host is not an alternate login origin; its canonical redirect/routing
must be decided and verified before launch.

Keep using the existing shared OpenStack.org OAuth application as previously
approved. Reconfirm its public client ID against the launch configuration before
any registration change. No confidential client secret belongs in Astro or its
browser bundle. Do not change RS256, grant types or scopes as part of this work.
The existing scopes remain OpenID, profile, offline access and Get My Member Info.

| Registration/configuration | Production value to review | Current boundary |
| --- | --- | --- |
| Visitor browser origin | `https://www.openstack.org` | Exact host required; production CORS/provider acceptance unverified |
| Visitor redirect URI | `https://www.openstack.org/auth/callback` | Candidate generates this URL; registration not inspected/changed |
| Visitor post-logout redirect | `https://www.openstack.org/auth/logout` | Candidate generates this URL; provider logout acceptance pending |
| Native Survey redirect URI | `https://www.openstack.org/user-survey/service/auth/callback` | Needs separate shared-client registration and coordinated Survey runtime acceptance |
| Survey frontend origin | `SURVEY_EMBED_ORIGIN=https://www.openstack.org` | Must match Survey CSRF policy; deployed value remains Astro staging |
| Survey redirect setting | `OIDC_REDIRECT_URI=https://www.openstack.org/user-survey/service/auth/callback` | Must match registered URI; deployed value remains Astro staging |

Preserve all existing Astro/staging callback and logout registrations while those
hosts remain in use. Do not replace their entries with the production URLs.
Adding callback/origin registrations is a separate security-sensitive admin action;
this document is a review packet, not evidence that they were added.

The browser shell and every auth action receive the deployment selected by the
server. Their shared coordinator rejects an attempt to change its client or
callback/logout origin without a reload. Storage stays origin-scoped; no tokens
are transferred from Astro to www. Editorial preview preparation discards the
deployment flag and all visitor activation variables, retaining only its existing
hosted Tina project ID.

Before enabling the production profile:

1. Prepare the separate production Worker configuration. Keep the current review
   Worker and editorial preview protection independent; do not edit their bindings
   to simulate a public launch.
2. Review/add the exact production origin and redirect/logout registrations while
   preserving existing ones. Verify token-endpoint and member-API CORS for www.
3. Prepare paired Survey configuration, its approved production database/runtime
   policy, CSRF/cookies and service transport. Current Survey production runtime
   remains deliberately blocked; this visitor profile does not remove that gate.
4. Rehearse on an isolated protected target using synthetic credentials/data;
   separately complete real provider callback, consent/error, refresh, expiry,
   browser storage, cross-tab logout and authorized/forbidden service acceptance.
5. Review public origins, indexing, routing, rollback and write behavior together
   before a separately authorized cutover. DNS changes remain manual.
