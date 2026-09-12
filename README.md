# OpenStack.org Astro comparison

An independent Astro implementation for side-by-side review with [the SvelteKit beta](https://beta.openstack.org). Preview: **https://astro.openstack.org**. Production remains untouched.

## Architecture

- Astro owns HTML templates, shared header/footer, navigation, marketing pages and editorial rendering.
- Existing React software components mount directly as an Astro `client:load` island. No Svelte, Gatsby, iframe or page proxy is used.
- Content and public API snapshots come from the latest deployed SvelteKit commit `032a17650b000ada14af6e1704d7faf16334c887` (including its dark footer), September 12, 2026. These files are a versioned copy, not an automatic cross-repository sync.
- The `MEDIA` binding reads the existing private `openstack-org-beta-media` R2 bucket. Only files in the copied publication registry can be served. It does not upload or mutate objects.
- Cloudflare Access uses the same reviewer policy as beta, with a separate application and hostname.

## Compare

Start with `/`, `/openstack-for-ai/`, `/vmware-migration-to-openstack/`, `/software/`, `/software/project-navigator/openstack-components/`, `/software/openstack-gazpacho/`, `/software/start/`, and `/openstack-map/`. Each page links to the same path on beta.

This is an initial framework comparison, **not full route or functional parity**. Basic migrated editorial pages render natively. Specialized summit/industry/app templates still show explicit comparison notices. `/comparison/` explains the limits. Authentication, CMS publishing and automatic catalogue refresh are not configured here. Existing API-owned data remains a development snapshot; it is not production certification.

The CMS choice is open: see [evaluation](docs/cms-evaluation.md). Git files remain content authority; changing the editor should not require replacing Astro templates.

## Local development

Use Node 24, `npm ci`, then `npm run dev`. `npm run check` and `npm run build` are required. Local R2 bindings are empty unless populated separately; hosted media is available through Access. Use a unique local port if working on multiple projects.

## Deployment

See [deployment protocol](docs/deployment.md). This repository has validation CI; deployment currently uses the local `openinfra` Wrangler profile. No beta GitHub secrets were copied or repurposed. Site authentication and CMS callbacks need separate configuration before enabling them on this hostname.
