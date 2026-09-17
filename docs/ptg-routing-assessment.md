# PTG routing assessment

September 17, 2026. Public browser observation and local source review; no meeting
was joined and no form was submitted.

Production `/ptg` and `/ptg/` return301 to `https://openinfra.dev/ptg`; the browser
ultimately reaches `https://openinfra.org/ptg/` with the current Foundation PTG
landing page. Its FAQ navigation points to `/ptg/faq`, which returns200 and displays
PTG questions and answers. The old `/ptg/ptgfaq/` production alias redirects through
the OpenStack landing page instead of directly to the current FAQ.

Astro now redirects the PTG root directly to the final Foundation landing page and
the old FAQ alias directly to the verified FAQ. This avoids importing an obsolete
local landing page or treating the existing Foundation page as a new application.
Both slash forms match through the existing redirect middleware. Review noindex
headers and production deployments remain unchanged.

Source: OpenStackweb/openstack-org, clean master2172298743fe807a92758cf307059b69a7dba668,
`openstack/code/PTGDynamic.php` and `themes/openstack/templates/Layout/PTGDynamic.ss`.
Despite its name, the reviewed controller primarily loads CSS; the model contains
editorial sections and image references. The template adds tabs and an external
newsletter embed. That source is not proof that the old template still serves the
public PTG root; current routing supersedes it.

JP decided on September 17 to retire all sixteen historical room destinations in
favor of the current Foundation PTG landing page. Astro now redirects those aliases
and the rooms index directly to `https://openinfra.org/ptg/`. Old meeting destinations
and query values are not retained or forwarded. This implements retirement of the
room aliases, not a new room-management application.

Both slash forms are covered by the existing middleware. Hosted verification follows
deployment; production routing remains unchanged.
