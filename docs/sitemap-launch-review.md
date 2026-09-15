# Sitemap launch review

The Astro checkout currently has no sitemap endpoint or sitemap integration. Staging deliberately retains `Disallow: /` and response-level `noindex,nofollow`. Cloudflare Access also remains in place. No indexing settings were changed by this review.

Run `node scripts/prepare-sitemap-review.mjs` with Node 24 to regenerate [the offline inventory](sitemap-review.json) from the recorded rendered metadata audit and current content registries. It is deliberately not placed in `public/` and is not submitted to a search engine.

The current inventory has **241 unique canonical content candidates**, with **985 audited paths held separately**. Held routes are mostly service snapshots, application routes and notices; this count is not a broken-page count. English paper query aliases consolidate into their clean canonical URL, translations retain their language query, and the two established summit archive aliases consolidate. Release announcements are editorial candidates; development Software catalogue entries are held.

This is a conservative starting set, not a complete or approved production sitemap. It uses the recorded audit's exact revision/worktree provenance rather than claiming to be a fresh hosted crawl. Imported editorial pages still require final content/route review. Native routes absent from that audit, including `/learn/`, `/coa/` and the supporting-organizations landing, need explicit coverage before final generation. Public profiles and service-backed pages need their separate data/readiness decisions. Confirmation/example pages are excluded.

Before launch:

1. Complete the route inventory and classify indexable content separately from notices, utilities, redirects and service data.
2. Verify every selected URL against the release build: HTTP 200, self-consistent canonical, useful content, public assets and appropriate indexing policy. Resolve aliases into one sitemap entry.
3. Generate the served sitemap from that approved registry. Use genuine modification dates if available; do not manufacture a fresh date on every build.
4. Coordinate production hostname, robots/header policy and sitemap publication as one explicit cutover. Staging must retain its own protection and noindex policy.
5. Check public crawler access and social previews after cutover; protected-browser acceptance cannot establish those results.

Technical launch work belongs here, not in the staff editorial spreadsheet. See [the editorial queue](editorial-review.md) for the limited content questions still needing human input.
