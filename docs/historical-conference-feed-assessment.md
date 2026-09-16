# Historical conference feeds: scope decision

Reviewed September 15, 2026. Astro base `e255ea7`; OpenStack SilverStripe checkout
`2172298743fe807a92758cf307059b69a7dba668`. This is source/database evidence, not
certification of a publicly accessible legacy feed. No runtime content changed.

## What the legacy code actually selects

`openstack/code/ConferencePage.php::rss()` constructs `RSSFeed($this->Children(),
...)`. Its separate `NewsItems()` selects up to five ConferenceNewsPage records
by descending Created date. Those are different queries.

The supplied production-instance archive contains the framework implementation:

- `47/framework/model/Hierarchy.php::Children()` calls `stageChildren(false)` and
  filters records through `canView()`.
- `stageChildren(false)` filters `ShowInMenus = 1` for SiteTree and allows
  extensions to augment the query. It is not a news-only selector.
- `47/framework/api/RSSFeed.php::Entries()` wraps the resulting records.
- `47/framework/templates/RSSFeed.ss` emits title, absolute URL, description,
  Date or Created as pubDate, optional author, and URL-based GUID.

Read-only queries against the local `openstack_full.SiteTree_Live` snapshot:

| Event | All children | In menus | In-menu records inheriting visibility | Explicitly restricted children |
| --- | ---: | ---: | ---: | ---: |
| San Francisco 2012 | 12 | 6 | 4 | 3 |
| San Diego 2012 | 12 | 5 | 5 | 3 |
| Portland 2013 | 11 | 4 | 3 | 4 |
| Hong Kong 2013 | 12 | 4 | 4 | 1 |
| Atlanta 2014 | 12 | 2 | 2 | 2 |
| Paris 2014 | 10 | 8 | 8 | 0 |

These are candidate counts, not computed anonymous authorization results. Parent
visibility, custom page classes and extensions can further affect canView/query
results. Do not export every child from the database into a public feed.
Menu children include ordinary content, sponsor listings and presentation/app
pages. Hidden news items generally do not enter this legacy menu-based query.

## Current Astro behavior and live limits

`src/pages/summit/[event]/rss.ts` calls `conferenceFeed()` with the same prepared,
Git-managed news list displayed on the landing page. It contains four, three,
five, three, three and one items respectively in the event order above. It is a
news digest, not equivalent to the legacy child-page feed. It currently omits
per-item dates and GUIDs. All descriptions come from sanitized prepared content.

On September15, anonymous public GET requests to each corresponding
`https://www.openstack.org/summit/<event>/rss` returned403 with text/plain content,
not RSS. No authentication or firewall bypass was attempted. This confirms an
availability limitation; it does not prove that the underlying legacy feed is
empty, retired or intentionally blocked.

## Proposed decision

Prefer an explicitly dated historical news feed using the existing Git/CMS
updates, with stable item identifiers and source-backed dates, rather than
reviving accidental navigation-page syndication. This needs a recorded editorial
choice because it intentionally differs from the source implementation.

Alternatives are to preserve the reviewed anonymous child-page membership and
ordering, or retire these historical feeds deliberately. Neither needs a new
microservice: this is a derived representation of archival content. App records
must retain their deferred status; a feed entry cannot substitute for an app port.

Pending the decision, the existing Astro feeds are unchanged. Full RSS parity is
not claimed. After a decision, verify XML parsing, item identity/date stability,
absolute links, safe HTML, headers and missing-event behavior against all six
feeds. Hosted verification also requires the protected browser session to be
renewed.

## Decision — September 15, 2026

JP chose to retire all six historical feeds. Known feed routes now return HTTP 410 Gone; unknown events retain 404. Archive pages and their readable news updates remain, with RSS subscription links removed. This supersedes the feed-replacement options above.
