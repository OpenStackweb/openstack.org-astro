# Hibiscus release parity — September 30, 2026

Source: https://www.openstack.org/software/openstack-hibiscus/ (live SilverStripe)
and https://www.openstack.org/ (live Gatsby), retrieved September 30.

Astro imports the published Hibiscus title, description, full announcement,
security acknowledgments and 598 ordered contributor credits into
`src/lib/content/releases/hibiscus.json`. The existing Tina **Release announcements**
collection edits this document. Whitespace-insensitive comparison of the prepared
Astro editorial HTML against the live announcement confirms all text and ordered
credits are retained. Only presentation markup and asset destinations change.

Updated editorial configuration:
- `announcement-banner.json`: 2026.2 Hibiscus copy and local announcement link.
- `home.json`: Hibiscus title, logo and CTA; Indri under-development link, matching
  the live Gatsby homepage. This also updates `/latest-release/`.
- `navbar.json`: Latest Release and Source Code point to Hibiscus.
- `media.json`: two versioned, content-addressed R2 assets. Existing assets remain.

Assets copied byte-for-byte into `openstack-org-beta-media/legacy/SHA256`:

| Local website path | Source | SHA-256 |
|---|---|---|
| `/assets/releases/hibiscus-banner.png` | Swift `www-assets-prod/Uploads/Banner3.png` | `3a3c7120bfb5cd7aa1a31aaa091de3f0d5877a9684809a12ade6fce6dc1f1d8b` |
| `/assets/releases/hibiscus-logo.jpg` | `https://www.openstack.org/static/b23216703bb42b2679a329b832e084ab/logo_vertical.jpg` | `718711190d45ffd5ba0807800d5fd6eb305f4abac6c34a76624050736a87e152` |

The project-map PDF uses the existing R2 asset with `?view=inline`. Software DRF
catalogue data and its unmerged refresh PR are unaffected by editorial publication.
Gazpacho remains available as its historical announcement.

## Why production still shows Gazpacho on legacy pages

The live Gatsby homepage already advertises 2026.2 Hibiscus. Its configuration
is edited through **Configurations → Announcement Banner** in the Gatsby CMS,
backed by marketing-site `src/content/announcement-banner/index.json`.
The fields are **Title** and **CTA Link**. This is separate from legacy rendering.

The stale exact wording comes from openstack-org:
`themes/openstack/templates/Layout/Includes/SiteBanner.ss`, lines 11 and 14
(reviewed local source commit `217229874`, corroborated by the live Hibiscus HTML).
Replace:

```diff
- Learn more about OpenStack's latest release, 2026.1 Gazpacho!
+ Learn more about OpenStack's latest release, 2026.2 Hibiscus!
- https://www.openstack.org/software/openstack-gazpacho/
+ https://www.openstack.org/software/openstack-hibiscus/
```

SilverStripe **Settings → Site Banner → Display The Site Banner** controls visibility
only (`openstack/code/CustomSiteConfig.php`). It does not provide copy or link fields.
Deploy the template through the legacy site's normal release process and refresh
its compiled template/cache as required by that process. Verify a legacy page
and the Gatsby homepage separately. No production SilverStripe/Gatsby change was
performed as part of this Astro import.

Checks: eight release documents pass registry validation; 199 existing tests pass;
Astro check has zero errors/warnings and two existing hints. Chrome compared live
production with the local Astro page. Local R2 images are unavailable in the
isolated dev binding; hosted asset rendering is checked after deployment.
