# WordPress blog gateway

Astro's Worker owns `/blog` and `/blog/*` routing; WordPress owns the content and
editorial workflow. The gateway strips `/blog` and reaches
`blog-origin-staging.openstack.org` through a dedicated Cloudflare Tunnel. There
is no old main-site fallback. The protected Astro review hostname remains the
entry point; the origin Access app accepts only the gateway's service credential.

Worker secrets: `BLOG_ACCESS_CLIENT_ID` and `BLOG_ACCESS_CLIENT_SECRET`. Keep
these in Cloudflare, never source or browser assets. The service token's initial
lifetime is one year from October 25, 2026; rotate before expiry. Editorial branch
Workers do not inherit these secrets and report the blog unavailable by default.

Origin: SSH `ubuntu@38.108.68.35`, isolated Nginx `127.0.0.1:8087`, existing osblog
PHP pool. `cloudflared-osblog.service` runs with a systemd credential sourced from
root-only `/etc/cloudflared/osblog.token`. Tunnel validates the Access audience.
WordPress selects Astro's URL only from a FastCGI server parameter set by that
listener, not from browser-supplied Host/forwarded headers. No database URL search
and replacement is performed. Production continues at www.openstack.org/blog.

The gateway strips Astro/Cloudflare cookies and caller Authorization before the
origin fetch. Only WordPress cookies pass; returned cookies are host-only and
scoped under /blog. Origin redirects are fetched manually and mapped to Astro.
Review responses are private/no-store and noindex. Stored production blog URLs
in HTML URL attributes are mapped to Astro; article text/database are unchanged.

The existing blog theme still loads old main-site JavaScript and some absolute
assets. This tunnel does not certify theme independence or authorize shutting
that host down. Those dependencies are recorded for follow-up, rather than
silently copied into Astro or mistaken for the independent WordPress runtime.

Server change log and rollback: `/home/ubuntu/OSBLOG-ASTRO-20261025.md`, linked from
its `/home/ubuntu/CLAUDE.md`. Backup `/var/backups/osblog-astro-20261025/` is root-only.
Superuser vhost, production blog vhost and database content are unchanged.
DNS is entered manually by JP. No automation may create or update DNS records.
