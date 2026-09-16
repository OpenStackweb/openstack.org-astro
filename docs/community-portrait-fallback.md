# Community portrait fallback

September 15, 2026; base Astro2d72af0. A hosted external-image decode review
covered six landing pages. Supporting Organizations80, VMware27, AI9, COA9 and
the homepage1 external image instances decoded successfully. Community had13
external instances, six decoded and seven failed. This is media delivery evidence,
not identity, membership, visual parity or service acceptance.

The seven failed portrait URLs return404 on both Swift endpoints. Production
also fails its corresponding portraits. No replacement identity photo was guessed
or copied from a different source. The service-owned member records stay unchanged.

The Astro card retained a server-only `failed = false` branch from the Svelte
implementation, so its intended initials presentation was unreachable. The shared
site fallback separately replaced failed portraits with plain name text. A native
MemberPortrait component now handles image error/load and already-completed image
states, showing an accessible initials tile on failure. The shared logo fallback
no longer selects member portraits, avoiding two competing handlers. Existing
social/profile links and successful images remain intact.

Normal build passed. Built-Worker browser checks verified all14 portrait states,
including valid images and failures, then recovery when a test-only image source
was changed to a working image. Reload restored the original source data. At390px,
document width375 and all image/fallback states were correct. Local R2 absence
causes one extra local fallback; the hosted expectation is seven failed external
portraits, not the local total of eight. Desktop initials layout was inspected.
The response fixture/source substitution was confined to the browser DOM.

Replacing missing portraits and confirming the historical staff/ambassador list
remain service/editorial work. This change makes unavailable media graceful; it
does not certify the roster as current.
