# SEO, links and media audit refresh

Base revision: `ca21cdb6babc68c4ee5af71f200602ffb736320c`, with the audit scope and
four exact blog-notice additions in this change. Full normal Tina/Astro builds passed.
Reports identify the parent revision and worktree changes; they are not proof of a clean
deployment at that parent revision.

The asset and internal-link audits previously omitted all seven modern release
announcements. They now enumerate the Git content directory and use the same release
path function as the renderer. The asset audit also now includes Learn, COA and Supporting
Organizations. Six existing asset-extraction tests passed.

## Findings and disposition

- SEO: 1,253 local rendered targets, zero inspection failures and zero metadata findings.
  This verifies the report's title, canonical, social metadata and WebPage JSON-LD checks.
  Protected preview noindex remains required. Social crawler access and public launch
  indexing are not certified by this check.
- Assets: 252 source pages, no source errors, 1,210 registry references, 73 public files,
  10 build files and 129 external references. No unresolved local references. Registry
  presence is not object availability or integrity; external references include legitimate
  separately owned resources and remain outside this audit's network verification.
- Links: expanding to the release announcements exposed four local 404s. Browser
  inspection verified the corresponding production WordPress articles return 200 and
  their article headings match. They now use the existing explicit blog migration notice
  with a link to that exact article. No blog content or backend was imported.
- Rerun after those additions: 252 source pages, 756 targets, no source errors or HTTP
  404 findings. There are 170 migration notices, 29 unverified external redirects, six
  fragments absent from server HTML, 16 query redirects and one asset/application
  redirect. These are acceptance gaps, not successful replacement applications.

The four article paths are:

- `/blog/celebrating-15-years-of-openstack/`
- `/blog/new-in-openstack-bobcat-horizon-team-introduces-time-based-one-time-password-totp-authentication-support/`
- `/blog/new-in-openstack-bobcat-ironic-team-supports-servicing-nodes/`
- `/blog/new-in-openstack-bobcat-manila-team-introduces-resource-lock-framework/`

Unknown blog paths still return 404; these are individually verified entries rather than
a wildcard that could disguise missing pages. The existing blog hosting/editorial decision
remains open. Local browser acceptance confirmed the notice title and exact outbound link.
Hosted acceptance follows deployment separately.
