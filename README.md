# OpenStack.org Astro

Source for **https://www.openstack.org**, deployed with Astro on Cloudflare Workers.
The protected review site is https://astro.openstack.org.

Original site code is licensed under [Apache 2.0](LICENSE). See
[third-party notices](THIRD_PARTY_NOTICES.md) for asset, dependency and trademark
boundaries, [contributing](CONTRIBUTING.md) for development, and
[security reporting](SECURITY.md) for private disclosures.

Dated migration and acceptance documents describe their historical checkpoints;
they are not the current production deployment status.

## Architecture and ownership

- Astro owns the shared layout, navigation, HTML content templates and routes. There is no SilverStripe page proxy.
- React islands provide Software and Marketplace interactions inside that layout. They do not supply a second site header or footer.
- Git owns editorial content; Tina provides forms, visual editing and branch-and-PR publishing. Provider, course and software catalogue records stay owned by their services.
- Cloudflare Workers serves the site. Shared R2 storage holds published legacy assets and CMS uploads, with access and publication checks in the application.
- Cloudflare Access protects reviewers. Visitor OpenInfraID login is a separate flow; development identity and service configuration are not production acceptance.

The initial import came from SvelteKit commit `032a17650b000ada14af6e1704d7faf16334c887` on September 12, 2026. Astro has developed independently since then; there is no automatic repository sync.

See [code organization](docs/code-organization.md) for where to make changes and [demo readiness](docs/demo-readiness.md) for review context. Historical audit files are dated evidence, not a blanket parity certification.

## Editorial workflow

Staff edit at `/admin/`. Tina protects `main`: saving starts or updates a draft branch and pull request. A maintainer builds the protected preview for the exact branch revision, reviews it, and merges the approved PR. Main's publishing workflow then checks, builds and deploys Astro. Preview builds are currently dispatched manually; a Save is not a deployment.

See [staff publishing steps](docs/tina-branch-preview-plan.md#staff-publishing-steps), [CMS coverage](docs/tina-proof.md), and [archive editing](docs/archive-editing.md). Less frequently edited archives remain Git-editable even where no Tina form is provided.

## Local development and verification

Use Node 24, then `npm ci` and `npm run dev`. Run `npm run format` before committing; CI enforces `npm run format:check`. Required checks are `npm run check`, `node --test scripts/tests/*.test.mjs`, `python3 -m unittest discover -s scripts/survey-story -p 'test_*.py'` (Python 3.11 or newer), and `npm run build`. A hosted-editor build validates the Tina schema and needs the configured CMS environment; without those credentials the site builds without the hosted editor UI. Never commit environment files or secret values.

After a Tina schema change, run `npm run cms:schema`, review and commit `tina/tina-lock.json`, and run the normal hosted-mode build. Local R2 storage is empty unless populated separately. Use a unique local port when working on multiple projects.

## Services and publishing

Software, Marketplace, Membership and Survey records are owned by their separate
services; this repository owns the website shell, editorial content and service
integrations. Blog content is served through the independent WordPress proxy.
Do not commit service databases or respondent-level exports here.

Main-branch publishing validates, builds and deploys production and the protected
review site. Refer to `.github/workflows/` for executable configuration. Older
migration documents remain available as dated provenance.
