# Event index ownership assessment

Reviewed September15,2026 against public pages and OpenStackweb/openstack-org
`2172298743fe807a92758cf307059b69a7dba668`. No backend or production changes.

## Other Summits: static historical promotion

`SummitHomePage.php` exposes IntroText, but `summit/templates/SummitHomePage.ss`
hardcodes the headline, four-day description, Berlin November13–15,2018 date and
four Boston/Sydney/Vancouver/Berlin cards. Boston is wrapped in PreviousSummit;
that helper only supplies a truthy context here, and the actual visible card text
and destination remain hardcoded. A fresh production visit shows all four cards.
This is not a query-generated current event catalogue. The discrepancy between
“four-day” copy and the displayed dates is inherited, preserved as historical copy.

Astro now renders the source copy and links from archives/other-summits.json with
the shared site shell and explicit archive context. The old Join Us button becomes
View Berlin2018 archive; session destinations remain video application notices.
This rare archive is Git-only, not a new Tina collection. No live registration,
PreviousSummit query or tracking script is reproduced.

Original logo/Boston/Sydney/Vancouver images recovered and visually inspected.
Original Boston hero and Berlin card backgrounds return404 from public Swift,
and production renders those areas black. The archive uses that same black
fallback instead of linking broken assets or inventing replacement artwork.
Available asset manifest: other-summits-assets.json. R2 uploads must be read back
and hash/size verified; this is separate from rendered asset audit coverage.

## OpenStack Days: mixed editorial and event application

`events/code/ui/OpenStackDaysPage.php` defines AboutDescription, HostIntro,
HostFAQs, ToolkitDesc, ArtworkIntro and CollateralIntro, plus CMS-related images,
videos, official guidelines, planning tools, artwork, collateral and media. These
are editorial resources, including their ordering/grouping, not a reason to keep
SilverStripe as an application server.

Its controller also queries future EventPage records by end date/category, lists
undated regional events, and joins FeaturedEvent to EventPage for past events.
The template displays sortable date/region tables. `events/js/openstackdays.js`
loads additional featured events from `api/v1/events/featured` with category and
offset. A static listing would not preserve this date-sensitive behavior.
A public browser visit confirms About/Host/Upcoming tabs, selected videos and
featured past-event cards. This observation does not certify each tab or API.

The Astro route now has a specific review notice. Staff should decide whether to
retain/modernize, consolidate with the current events destination, or archive this
legacy route. Recommendation if retained: Git/Tina/R2 for organizer resources;
reuse an agreed event-data service if available, otherwise assess a deliberately
managed editorial event model. Do not create a new service or silently duplicate
live events into Git without that decision. No event records or forms were changed.

Include this mixed editorial/application decision in the final Applications &
deferred work sheet, linking both production and Astro `/events/openstackdays-old/`.

Validation: exact missing-background filenames were not found in either supplied
l.o.o.tgz or assets.tgz archive listings. Four available images passed R2 readback
size/SHA256 verification (one reused, three uploaded). Normal build, Astro check
258 files/zero errors or warnings/one existing hint and 100 tests pass. Desktop1440
and mobile390 were visually reviewed; one H1, no horizontal overflow, original
headline foreground/background colors confirmed against production. Local image
requests used page-scoped private files; hosted R2 rendering requires its own check.
The specific OpenStack Days notice renders at mobile width. Expanded SEO audit
has1,241 targets with no issues; offline sitemap253candidates/986held. Asset audit
230sources has no source errors or unresolved local references. Internal-link
findings include169migration notices and six client-tab fragments; these remain
outstanding or explicitly deferred, not certified working applications.
