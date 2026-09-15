# Remaining Swift content references

September 15, 2026. Reproduce with `node scripts/audit-swift-content.mjs --check-remote`.
The machine-readable findings and exact source fields are in `swift-content-audit.json`.

The inventory found 19 references to 17 unique URLs. Every remote HEAD request returned
200. That establishes current endpoint availability, not byte integrity or visual parity.
The media registry is deliberately excluded: its original source URLs are provenance,
not necessarily runtime dependencies.

## Editorial files suitable for selective R2 migration

Seven release banners remain external: Antelope, Bobcat, Caracal, Dalmatian, Epoxy,
Flamingo and Gazpacho. Antelope and Bobcat also link to the same historical OpenStack
map PDF. Preserve that historical document rather than silently replacing it with the
current map. These eight distinct files should be downloaded, inspected, checksummed,
uploaded with readback verification, and linked through their editable release content.

These are release **announcement** content, not Software catalogue service records.
`src/pages/software/[...path].astro` loads them through `prepareReleaseAnnouncement`
and the Tina release editor. `renderEditorialBody` currently preserves their external
image URLs. They therefore remain actual content dependencies.

The Use Cases hero is already mapped to `/assets/Uploads/userstories.png` by
`prepareUseCases` / `localMediaHref`. Do not copy it again merely because its stored
editorial URL is still Swift. This audit checks the mapping, not the deployed object.

## References requiring different handling

- Seven lunch-menu PDF URLs occur in Boston and Sydney schedule snapshots. Astro's
  catch-all currently serves a migration notice for schedule routes, explicitly awaiting
  the Summit API integration. These are not seven currently broken rendered links.
  Preserve the snapshots and review attachments when accepting that application;
  similar filenames already in the registry do not prove identical bytes.
- Two historical mobile-app pages link to the same Android installer in the separate
  `summit-mobile-apps` container. Endpoint availability does not establish compatibility,
  continued support, or whether distributing the old app is desirable. Leave this as
  an editorial retain/close decision; do not promote the installer into website media
  as part of routine image migration.

This source inventory does not cover external URLs in scripts, stylesheets, API responses,
or other storage hosts. It complements the rendered asset audit rather than replacing it.

## Release media migration follow-up

The eight editorial files above were downloaded and visually inspected, then uploaded to
the shared private R2 bucket with SHA-256 and byte-count readback verification. Exact
source URLs and checksums are in `release-banner-assets.json` and `release-map-assets.json`.
The map visibly says **Version 2022.09.01**; its filename is not reliable version evidence.
Its one-page PDF contains no forms, JavaScript or encryption. No files were transformed.

Browser inspection of all seven production release pages confirmed the banner source
URLs. Release JSON now uses local registered asset paths, preserving every other field
and the Tina editing workflow. The PDF is explicitly served inline. Schedule snapshots
and mobile installer URLs are unchanged. Seventeen existing media/list/release-editor
tests passed. Deployment and hosted visual/byte acceptance must be recorded separately;
upload success alone does not prove the pages are serving this revision.

Upload commands (private download directory as the argument):

```sh
node scripts/upload-conference-media.mjs <directory> --release-banners
node scripts/upload-pdf-alias-media.mjs <directory> --release-map
```
