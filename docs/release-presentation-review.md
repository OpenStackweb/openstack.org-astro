# Release announcement presentation

Reviewed September 15, 2026 against production Gazpacho and local SilverStripe source
`openstack-org` revision `2172298743fe807a92758cf307059b69a7dba668`.

`software/templates/Layout/SoftwareSubPage.ss` wraps `$Content` in
`.software-main-wrapper > .container.inner-software`. Its controller adds Software
navigation and styles; the release prose is CMS content, not a catalogue API response.
`software/scss/software.scss` defines the pale `#edf2f7` surface, white rounded card,
40px padding and 15px horizontal padding below 550px. Browser measurements confirm a
1170px desktop card, 34px title, 14px/20px body text and 350px release banner.

The Tina `ReleaseAnnouncement.astro` component now owns this presentation directly,
rather than inheriting the generic Editorial page's breadcrumb and 17px body typography.
The sanitized body, editable fields and contributor order are unchanged. Semantic
section headings remain headings even when styled like production's bold section labels.
Mobile artwork stacks and stays within the content width. Other editorial page families
retain their existing styles; obsolete release-specific rules were removed from Editorial.

Local full hosted-editor build passed. Twelve existing release editor/latest-release tests
passed. Browser review used the built local Worker, with local `/assets/` requests supplied
from the authenticated deployed Astro media endpoint (local R2 does not contain these
objects). That substitution verifies presentation, not local R2 configuration.

All seven local release pages have one main landmark, one H1 and no horizontal overflow
at 390px. Rendered contributor counts: Antelope 601, Bobcat 585, Caracal 539, Dalmatian
486, Epoxy 448, Flamingo 479, Gazpacho 389. Gazpacho desktop and mobile screenshots were
inspected against production measurements. Shared CMS previews render the same component.

Remaining: the Astro Software navigation follows the integrated app's existing navigation
contract and differs from the old two-level SilverStripe tabs. Review that alongside the
production catalogue integration. This change does not certify full Software parity, visitor
authentication, every release's exact production typography, or a new CMS save round-trip.
Hosted deployment acceptance should be recorded separately after CI completes.
