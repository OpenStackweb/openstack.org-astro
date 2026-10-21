# SilverStripe website independence

Astro serves its own pages, CMS and bundled/R2 media. Application-owned HTTP requests reject the retired website hosts before network access and stop upstream redirects. Independent Summit API, Search, OpenInfraID, Software, Survey, Marketplace, TinaCloud, GitHub and Google services remain supported.

First-party content links resolve on Astro. Unavailable archived destinations receive Astro’s local 404; they do not fall back to the retired application. Migration notices do not offer legacy form links. The independent WordPress blog retains its existing public URL. Production canonical metadata remains unchanged.

Two company logos previously requested through SilverStripe now use the existing archived media objects. No new media uploads or registry changes are required.

Verification: `node --test scripts/tests/*.test.mjs`, `npm run check`, `npm run build`, then serve the built Worker locally and run `AUDIT_BASE=http://127.0.0.1:4401 node scripts/audit-silverstripe-independence.mjs`. The audit inspects rendered resource, form, navigation and redirect destinations across published metadata and the route inventory, plus local stylesheet references. It does not submit forms or certify unimplemented features. Browser checks cover the company logo and unavailable-workflow notice.

This change does not activate www.openstack.org routing, change DNS, stop SilverStripe, retire the shared database, or change the independent applications. Some independent APIs use tables with SilverStripe-era names; their database remains required. Legacy workflows without replacements remain unavailable on Astro. Blog origin routing must remain independent when the production hostname is switched.
