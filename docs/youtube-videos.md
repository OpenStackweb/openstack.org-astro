# OpenStack video discovery

Implemented September 22, 2026 for protected Astro `/videos/`. YouTube owns the
videos and metadata; Git/Tina owns page copy and optional inclusion/exclusion
IDs. No SilverStripe or Summit API request is involved.

## Selection

Channel: `UCQ74G2gKXdpwZkXEsclzcrA` (OpenInfra Foundation, legacy username
OpenStackFoundation). Only public, non-live videos belonging to this channel
qualify. Four newest relevant videos are shown, followed by four other relevant
videos published within the last calendar year, ranked by total YouTube views.
These are lifetime views on recent uploads, not views gained during the year.
No duplicates appear between sections. Fewer cards are shown if insufficient
videos qualify; old videos are never substituted into the popular-year section.

Relevance is evaluated before ranking. Explicit OpenStack titles, contextual
component titles and OpenStack topic-playlist membership provide strong signals.
Broad Summit/Days/Meetup playlists do not qualify as topic evidence. Descriptions
are bounded and stripped of common channel boilerplate; other-project titles
require the named project and OpenStack in an integration-context sentence.
Ambiguous videos are omitted. This transparent heuristic is conservative, not
semantic certainty. Tina overrides provide corrections without routine curation.
Inclusion allows ranking, not pinning, and cannot bypass channel/privacy checks.

The first read enumerated 5,568 uploads and fetched metadata for 178 candidates
in 149 YouTube requests. Review caught conflicting Zuul-title/OpenStack-description
metadata and tightened the filter rather than adding a one-off hidden exclusion.
Generic Gerrit, Kata, Git tooling and ambiguous talks were excluded. Review the
output after significant channel/playlist changes; selection is not a transcript
analysis and might omit relevant talks with weak metadata.

## Request and storage boundaries

**Page loads make zero YouTube Data API calls.** They read one cached R2 JSON
object, `_feeds/astro/openstack-videos-v1.json`. It is outside the media publication
registry and cannot be fetched through the public asset handler. The browser
loads YouTube thumbnail images; a privacy-enhanced player loads only on click.
Ordinary watch/channel links also work without JavaScript.

The Astro Worker schedules refresh at `17 6 * * *` (06:17 UTC daily). Its
`YOUTUBE_API_KEY` secret is restricted to YouTube Data API v3; no channel-admin
privileges, OAuth, or user credentials are needed. Key is sent in an API header,
never a browser bundle, URL query or Git file. Only the scheduled handler calls
the API; manual bootstrap/diagnostic refresh is an explicit operator action.
Editorial preview Workers inherit neither cron triggers nor this secret.

Refresh enumerates the complete uploads collection (bounded to 10,000 entries),
then fetches detailed metadata for the rolling year and the newest 100 candidates.
If necessary it walks older candidates until Recent has four matches. Pagination
cycles, caps and HTTP errors fail the entire refresh; they never publish partial
rankings. Raising limits as the channel grows is an operator change. One atomic
R2 write replaces the cache only after success. The key remains private in the
existing media bucket; asset aliases and business data are not modified.

On refresh failure the previous cache can be served for seven days. Older caches
are hidden and the channel link remains. The daily job deletes unrefreshed API
data after 28 days, before YouTube's 30-day limit. If disabling the job, also
delete the feed object; hiding expired data alone does not delete storage.

## Operations

- Cloudflare Worker: `openstack-org-astro`; secret: `YOUTUBE_API_KEY`.
- Daily refresh failures are surfaced as failed scheduled invocations in Cloudflare.
- Read-only export: `node scripts/refresh-youtube-videos.mjs /private/path/feed.json`
  under Node24. Output must be outside this repository. It reports selected IDs
  and request counts; it never uploads or changes the site.
- Bootstrap after review: `wrangler r2 object put openstack-org-beta-media/_feeds/astro/openstack-videos-v1.json --file /private/path/feed.json --content-type application/json --remote --profile openinfra`.
- Remove temporary metadata exports within28days (normally immediately after use).
- For local scheduled-handler testing, Wrangler's working endpoint in4.129.1 is
  `/cdn-cgi/handler/scheduled?cron=17+6+*+*+*` with `--test-scheduled`.

## Editorial and migration boundaries

Tina's **Videos — page and selection** collection supports branch-and-PR edits to
headings, explanation, fallback copy and optional include/exclude IDs. Exclusions
apply as soon as the change is published; inclusion of a video outside the cached
candidate set waits for the next scheduled refresh. Drafts must not trigger API
requests or shared-cache writes.

The new discovery page replaces only the `/videos/` notice. Historical video
and event URLs still require exact mapping; they are not blindly redirected to
the channel or this page. Their notices now reflect the approved YouTube approach.
Existing historical page embeds are preserved. The full legacy video catalogue,
search and event/speaker filtering are intentionally not recreated here.

Sources: [YouTube playlist retrieval](https://developers.google.com/youtube/v3/docs/playlistItems/list),
[video metadata](https://developers.google.com/youtube/v3/docs/videos/list),
[data retention](https://developers.google.com/youtube/terms/developer-policies),
[Astro custom Worker entrypoint](https://docs.astro.build/en/guides/integrations-guide/cloudflare/#changed-custom-entrypoint-api).
