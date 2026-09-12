# Astro SEO and Open Graph audit notes

Initial comparison, September 12, 2026. Carry forward the SvelteKit SEO audit; this is additional evidence, not a completed production audit.

- Comparison HTML and Worker responses are noindex/nofollow; Access protects the hostname, including assets.
- Canonical URLs point to www.openstack.org, not the comparison hostname. Review slash normalization and release query canonicals before production.
- Shared layout includes title, description, OG title/description/image and favicon. Several specialized templates still need their route-specific descriptions, OG images, Twitter metadata and structured data carried over; do not call metadata parity complete.
- Homepage social image is local. R2 media retains existing checksums, URLs and inline PDF disposition.
- Navigation/footer inherit some historical external HTTP links, tracking query strings and legacy branding/hosting credits from the source content. Review these centrally after editorial parity, not by ad hoc template replacements.
- No analytics/Cookiebot integration was enabled merely to reproduce a screenshot. Consent and analytics remain an explicit deployment requirement.
- A comparison notice with HTTP200 is not a migrated content page. `route-audit.json` distinguishes native editorial rendering from notices; production must not ship those statuses as completed pages.
- Asset-loading checks must distinguish below-fold lazy images from failed requests. Check actual network failures and scroll-visible rendering.
- The new software island must retain server-rendered names, links and descriptions even with JavaScript disabled; route audit asserts catalogue content in HTTP HTML.
