# Brand agreements and historical sponsor pages

Reviewed September 15, 2026 against OpenStackweb/openstack-org commit
`2172298743fe807a92758cf307059b69a7dba668`. This is source evidence, not a
certification of current production integrations. No forms were submitted,
agreement records read, emails sent, or backend changes made.

## Brand guidance is part of a workflow

`openstack/code/LogoGuidelinesPage.php` adds editorial `Preamble` and
`TrademarkURL` fields alongside `Content`. Its layout renders that copy and a
GuidelinesForm. Submission sets `ReadGuidelines` in the session and redirects to
the configured next step. This is more than an ordinary content page.

`LogoRightsPage.php` owns editorial agreement content, `LogoURL`, `EchoSignCode`
and related `LogoRightsSubmission` records. The actual reviewed layout
`themes/openstack/templates/Layout/LogoRightsPage.ss` embeds an EchoSign widget;
it does **not** render the PHP `LogoForm`. Therefore the presence of that handler
does not prove it is the current submission path. The handler saves contact and
company/address fields, emails staff, sets `LogoSignoffCompleted`, and redirects.
`LogoRightsSubmission.php` also provides CMS editing for those records.

`LogoDownloadPage.php` and `WebBadgeDownloadPage.php` check `ReadGuidelines`;
`RestrictedDownloadPage.php` checks `LogoSignoffCompleted`. These are checks in
page controllers, not proof that every underlying asset URL enforces the same
authorization. No restricted downloads were extracted or republished.

Known inventory entries:

- [Distribution guidelines](https://astro.openstack.org/brand/openstack-distribution/)
- [Powered-by guidelines](https://astro.openstack.org/brand/powered-by-openstack/)
- [Storage guidelines](https://astro.openstack.org/brand/storage-powered-by-openstack/)
- [Compatible agreement](https://astro.openstack.org/brand/openstack-compatible/trademark-agreement/)
- [Cloud agreement](https://astro.openstack.org/brand/openstack-powered/openstack-cloud-trademark-agreement/)
- [Training agreement](https://astro.openstack.org/brand/openstack-training/trademark-agreement/)

**Decision requested:** assess whether current Foundation brand/licensing
services can replace the legacy process before creating a new application.
Signing integration, record ownership/retention, staff permissions and download
requirements remain unverified. Approved guidance can stay in Git/Tina; private
submissions belong in an approved service, never public Git or media storage.

## Historical sponsors use relational company records

`SponsorsPage.php` removes the ordinary Content CMS field and exposes a Company
relation editor. Join fields are `SponsorshipType`, `SubmitPageUrl` and `LogoSize`.
The layout renders Headline, Premier, Spotlight, Event, Startup and InKind groups,
with InKind labeled Community Partners. The enum also contains Media, but this
layout does not render a Media group. Queries order each group by ID.

`Company.php::SubmitLandPageUrl` chooses the event-specific URL then falls back to
the company's URL. `SubmitLogo` uses `BigLogoPreview`, which resizes BigLogo to
300px and returns “missing” when absent. The reviewed layout does not use the
join's LogoSize field. Shared Company records mean a database snapshot need not
preserve the logo or website used at the original event.

The inventory contains four routes:

- [Paris 2014](https://astro.openstack.org/summit/openstack-paris-summit-2014/sponsors/)
- [Atlanta 2014](https://astro.openstack.org/summit/openstack-summit-atlanta-2014/sponsors/)
- [Hong Kong 2013](https://astro.openstack.org/summit/openstack-summit-hong-kong-2013/sponsors/)
- [Vancouver 2015](https://astro.openstack.org/summit/vancouver-2015/sponsor-logos/)

**Proposed, awaiting decision:** preserve verified published listings as clearly
dated Git-managed historical archives. Do not turn company master data or current
sponsorship management into page copy. Database joins, actual logos and rendered
listings still need verification before import; no data was frozen by this change.

Both families now have explicit review notices. Add them to the final Applications
and deferred-work Google Sheet; this document alone does not update that workbook.
