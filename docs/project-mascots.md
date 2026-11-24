# Project mascot gallery

The `/project-mascots/` page reads public branding metadata from Software API at
`https://software.openstack.org/api/public/mascot-gallery/`.

## Editing

- Software admin → Mascots: name, project, visibility, and ordered download variants.
  Upload files through the existing Files interface, then add their public HTTPS URLs
  to the mascot’s download rows. Hidden mascots never appear in the public projection.
- Tina → Project mascots — page copy: introduction, headings, videos and FAQs.
  Inline visual editing uses the same document. Package metadata is not copied into Tina.

The API response is deliberately limited to public project names and download links.
The page shows an explicit temporary-unavailability message if the service fails.
Search and expansion work without fetching any additional data; downloads remain
ordinary links and package expansion works without JavaScript.

## Recovery provenance

Recovered November 24, 2026 from the published-project allowlist in
`mascot-package-audit.json` and the original public VEXXHOST image bucket.
The Software import contains 67 project packages and 724 unique downloads (734 checked URLs include ten identical RefStack folder aliases);
all 734 returned HTTP 200 during the recovery check. Original PNG, JPG, EPS, SVG and
AI files remain in their existing object storage. Historical duplicate identity
rows were preserved; downloads attach to one existing identity for each project.
The Software import validates identities, defaults to dry-run and is idempotent.

The page copy, three videos and 16 FAQs were recovered from SilverStripe’s
`themes/openstack/templates/Layout/AboutMascots.ss`, including its licensing text.
Historical references and contacts are editable rather than silently rewritten.
