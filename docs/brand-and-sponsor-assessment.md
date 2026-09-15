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

**Decision approved by JP, September 15:** assess whether current Foundation brand/licensing
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

**Approved by JP, September 15:** preserve verified published listings as clearly
dated Git-managed historical archives. Do not turn company master data or current
sponsorship management into page copy. The four published listings have now been reconciled against database joins;
see the implementation evidence below.

Brand workflows retain explicit review notices. The sponsor routes now have native
historical content. The final workbook should reflect this ownership distinction;
this document alone does not update that workbook.

## Approved sponsor archive implementation

All four production pages returned 200 in Playwright. Every tier count, ordered
company name (where the original logo supplied alt text), and destination matched
the SELECT-only export of SponsorsPage_Companies, Company and File. The export
excluded contact/admin fields. Counts: Paris 65, Atlanta 64, Hong Kong 47 and
Vancouver 55; 231 entries total. The local database was stopped afterward.

Production displayed 182 logo elements and 49 literal “missing” labels. Archives
retain those 49 sponsors by company name. Six bare-www destinations (five unique
companies) are trimmed and given HTTPS so they do not resolve below the Summit
URL; this is URL normalization, not current external-site availability assurance.
Two broken generated logo URLs use their already migrated originals.

68 distinct production image URLs matched existing registry keys. Nine additional
images were fetched from the public Swift assets, uploaded to content-addressed
R2 objects and downloaded again with byte-length/SHA256 equality. The remaining
two original logos reuse approved registry assets. No storage object was replaced.

The importer asserts the complete tier membership and order against the public
DOM capture before writing Git records. Existing SponsorArchive rendering now
accepts missing images/destinations without creating empty image requests or
self-links. Invalid nonempty protocols/asset paths remain rejected. These four
records are intentionally Git-only and inherit shared event navigation/resources.
105 tests and the normal hosted Tina/Astro build passed; typecheck has zero errors
or warnings. Hosted visual acceptance and updated workbook rows remain next.

## Existing Foundation reuse assessment — September 15

Reviewed source:

- `OpenStackweb/osf-website` at `d084a30bdaf12c079f7c350dcaacb89f2c5991a2`:
  `src/pages/brand/index.md`, `src/pages/legal/trademark-policy/trademark-policy.md`,
  `src/components/ProfileLegals.js`, `src/actions/user-actions.js`, `gatsby-node.js`.
- `OpenStackweb/summit-api` at `67248142a3ceed9c7b3a5301a0cf52da30792469`:
  `app/Repositories/Main/DoctrineLegalDocumentRepository.php`,
  `app/Models/Foundation/Main/LegalAgreement.php`,
  `app/ModelSerializers/LegalAgreementSerializer.php`,
  `app/Services/Model/Imp/MemberService.php`, `routes/public_api.php`.

The live [Foundation logo catalogue](https://openinfra.org/brand/logos/) and
[trademark policy](https://openinfra.org/legal/trademark-policy/) provide existing
public destinations. The catalogue links OpenStack logos and the policy. The
policy directs license inquiries to the Foundation and distinguishes uses that
require a separate license. This establishes a public handoff option, not proof
of its internal approval, signature or record-management system.

The Foundation website's profile UI displays `legal_agreements` expanded from
`/api/v1/summits/current/members/me`. The reviewed API's
`MemberService::signFoundationMembership` selects the individual membership
agreement using `LegalAgreement::Slug`. This is evidence of membership agreement
handling; it is not a generic trademark-license signing API.

**Retirement dependency:** `DoctrineLegalDocumentRepository` reads `ID`, `Title`,
`Content` and `URLSegment` directly from **`SiteTree`**, filtered to
`LegalDocumentPage`. It does not read `SiteTree_Live`. The public legal-document
endpoint and expanded agreement serializer use this repository. The Foundation
build also requests `/api/public/v1/legal-documents/422`. Existing API hosting
therefore does not prove the legal-document content is independent of the
SilverStripe database. Retiring the PHP application and removing its database
are different milestones. Preserve the database dependency until the document
source, identifiers and consumers have an approved migration. No draft legal
records were queried or published during this assessment.

No equivalent trademark signing/download-entitlement implementation was found in
the reviewed Summit API `app`/`routes` searches for `LogoRights`,
`LogoSignoff`, `ReadGuidelines`, `EchoSign` or `trademark`. This scoped negative
result does not establish that the Foundation lacks a separate operational
service or manually managed process.

**Recommendation, not yet implemented:** reuse the Foundation's maintained public
policy/logo destinations and its existing licensing intake if the owner confirms
it replaces these old forms. Keep legal agreements, signatures and private
submissions with that process. Do not build a new application merely to reproduce
old session flags, and do not treat a membership agreement as trademark consent.

Remaining decisions and acceptance:

1. Identify the current licensing owner/system, supported license categories and
   whether the six legacy routes should hand off there or retain explanatory copy.
2. Confirm how historic signed agreements and any restricted assets are retained
   and administered; no private records have been inventoried or migrated.
3. Verify signing, staff review, notification and download access using an approved
   test workflow before claiming functional parity.
4. Plan the API legal-document source/ID migration separately from PHP retirement.
   Its current deployed database/configuration remains unverified.

No form submission, email, agreement acceptance, download entitlement change,
backend modification or production business-data write occurred.
