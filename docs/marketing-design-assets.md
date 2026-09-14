# Marketing artwork downloads

September 14, 2026: reviewed the one-page PDF-compatible previews embedded in the original Illustrator sticker and hoodie files linked from production `/marketing/`. The sticker contains OpenStack branding; the hoodie contains back/side print layouts. Original `.ai` bytes are preserved, using the source's `application/postscript` MIME type and attachment delivery.

The two content-addressed objects already existed in the shared R2 bucket. The bounded `--marketing-designs` manifest verifier downloaded each and confirmed its exact size and SHA-256 against the public source downloads. No object overwrite or bucket enumeration was needed. The manifest records source URLs and checksums; only the two public aliases were added to Astro's publication registry.

Validation: all five media handler tests passed, including Illustrator filename/attachment behavior. The normal TinaCloud-checked Astro build passed. Hosted browser download acceptance remains pending Cloudflare sign-in. Marketing must also be added explicitly to the broader SEO and asset audit enumerators; existing audit totals do not yet cover this new standalone page.

## Expanded route audit

The September 14 audit now explicitly includes `/marketing/` and recognizes `.ai` anchor downloads. Against the normal build at local port 4512: SEO inspected 1,228 targets with zero inspection failures or per-route findings; asset inspection covered 220 page sources and 11 stylesheets, with 1,044 R2 registry references, 56 public files, 10 build files, 49 external references and zero unresolved local references. These are reference/metadata checks, not proof of remote asset availability or full SEO acceptance.

Internal-link inspection covered 220 sources and 643 targets. It found one 404 newly exposed by Marketing: `/marketing/make-some-news-with-openstack/`. A fresh production HTTP check returned 301 to `/make-some-news-with-openstack/`, whose response was itself 404. Local SilverStripe inventory identifies an older plain Page record (835, 7,984 content bytes, shortcodes), requiring source/dependency review before restoration. The link remains visible in the report; no redirect to a missing destination was added. Other findings include deferred migration notices and browser/query/external verification needs. Marketing hash tabs require browser acceptance; the fragment audit intentionally does not certify JavaScript behavior.

## Video interaction acceptance

September 14: Chrome against local normal build port 4514 confirmed zero player `src` attributes initially; opening Rocky loads its youtube-nocookie player; closing it removes `src`; reopening then selecting Get Involved hides the software panel, closes the disclosure and leaves zero loaded players. This fixes the previous behavior in which closing the disclosure left its iframe loaded. A no-JavaScript YouTube link is provided. Normal TinaCloud-checked build passed; Astro check: 231 files, zero errors/warnings, one existing importer deprecation hint. This verifies player lifecycle, not video availability/playback inside YouTube or hosted CMS remount behavior.

Editorial review candidate: the Icehouse card's second paragraph says “The Mitaka release.” This wording is present in the captured production Marketing HTML (lines 986–988); it was preserved and flagged rather than silently changing the associated historical contributor statistics.

Mobile review at 390px: Chrome verified Events and Promote Your Product each select the correct panel, with document width 375px (no horizontal overflow). Historical Graphics renders seven cards. Local R2 thumbnails do not load without a bucket binding, so this is not hosted image acceptance. The initial historical-link interaction left the viewport at the bottom; a follow-up change moves focus and scroll to the selected historical panel. Final acceptance recorded after rebuilding below.

Rebuilt mobile acceptance at port 4515: choosing Graphics focuses the `graphics` section, makes it visible and scrolls its beginning into the viewport; document width remains 375px at a 390px viewport. Viewport override reset afterward. Normal build and Astro check passed (zero errors/warnings; existing importer hint). Hosted image rendering and full Tina repeated-list editing remain separate open acceptance items.
