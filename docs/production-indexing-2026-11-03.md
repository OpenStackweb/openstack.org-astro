# Production indexing preparation — November 3, 2026

The launch candidate requires both SITE_DEPLOYMENT=production and
SITE_INDEXING_ENABLED=true, on exactly https://www.openstack.org, before public
HTML or registry-published media becomes indexable. Staging, preview origins,
private workflows and failed HTML responses retain noindex. Editor media delivery
keeps its private defaults; the public flag applies only after registry lookup.

robots.txt is now a runtime route with the same guard. The launch flag is omitted
from the unrouted candidate configuration and must be enabled during cutover.
No production Worker upload, hostname routing, DNS or secret changes were made.

Validation:289 Node tests passed; Astro check0errors/0warnings/5hints; production
build and candidate configuration preparation passed. Local HTTPS HTTP checks
verified production homepage index headers, profile noindex, production robots,
and staging noindex/robots restrictions. Media tests cover production/staging,
missing flag, unpublished files, response bodies, ranges and cache validators.

The recorded sitemap candidate is still an offline September audit artifact.
Refresh the rendered route audit and sitemap before launch; do not serve that
stale artifact as a current sitemap. Final backend origins, identity callbacks,
CMS credentials, independent service database refreshes and browser acceptance
remain separate launch work.
