# Marketplace production origin — November 3, 2026

Production public catalogue/company-profile requests and the admin redirect now
require MARKETPLACE_SERVICE_ORIGIN=https://marketplace.openstack.org together
with SITE_DEPLOYMENT=production. Staging retains its separate origin. Cross-profile
origins fail closed. Missing configuration does not redirect staff into staging.
The unrouted production candidate generator still omits the backend binding;
activate it only after the production service/data and callback are accepted.

Validation:291tests pass, Astro check0errors/0warnings/5hints, production build and
candidate preparation pass. Local HTTPS admin request with production binding
returns302 to https://marketplace.openstack.org/marketplaceadmin/ with private,
no-store caching. API fixture tests verify production reads, origin rejection,
public-only headers and existing company-profile sanitization. No production
Worker upload, DNS or service routing change was performed.

A second local HTTPS check without the Marketplace binding returned503 with no
Location header, confirming an unconfigured production candidate does not send
staff to staging. Both local Wrangler processes were stopped after verification.
