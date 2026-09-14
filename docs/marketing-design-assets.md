# Marketing artwork downloads

September 14, 2026: reviewed the one-page PDF-compatible previews embedded in the original Illustrator sticker and hoodie files linked from production `/marketing/`. The sticker contains OpenStack branding; the hoodie contains back/side print layouts. Original `.ai` bytes are preserved, using the source's `application/postscript` MIME type and attachment delivery.

The two content-addressed objects already existed in the shared R2 bucket. The bounded `--marketing-designs` manifest verifier downloaded each and confirmed its exact size and SHA-256 against the public source downloads. No object overwrite or bucket enumeration was needed. The manifest records source URLs and checksums; only the two public aliases were added to Astro's publication registry.

Validation: all five media handler tests passed, including Illustrator filename/attachment behavior. The normal TinaCloud-checked Astro build passed. Hosted browser download acceptance remains pending Cloudflare sign-in. Marketing must also be added explicitly to the broader SEO and asset audit enumerators; existing audit totals do not yet cover this new standalone page.
