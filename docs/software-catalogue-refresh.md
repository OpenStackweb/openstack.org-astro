# Staff-controlled Software catalogue refresh

Normal Tina saves and site deployments continue using the last approved catalogue.
This workflow fetches a candidate only when an enabled, verified Tina editor
explicitly requests it. Software records remain owned by the Software service.

## Staff workflow

1. Update records in the Software service's Django admin.
2. In Tina, open **Software — page content and admin**. The **Software catalogue**
   panel shows the bundled release, snapshot refresh time, last request and any
   pending review. An old snapshot with no timestamp says so explicitly.
3. Click **Refresh software catalogue**. This is an action, not a saved content
   field. It does not require saving the editorial page and cannot stay enabled
   across future deployments.
4. Use **Check status** to see the run and candidate pull request. The job fetches
   current and historical catalogue data plus sample configurations, validates the
   allowlisted public projection, and compares it with the approved snapshot.
5. No differences means no PR or deployment. Differences create a new
   `software-refresh/RUN-ATTEMPT` branch and PR containing only the four catalogue
   snapshots and their refresh metadata. The PR includes counts and a protected
   branch-preview link. The job explicitly dispatches the existing preview workflow
   because pushes made with GitHub's built-in workflow token do not trigger it.
6. Review data changes and the successful preview before merging. Merge triggers
   ordinary Astro publishing. Do not treat a successful fetch as completed
   publication. Revert the merged PR to restore the previous snapshot if needed.

A second request is blocked while a run is active or a catalogue PR awaits review.
The workflow serializes jobs and checks open PRs again, covering concurrent clicks.
It never overwrites a pending review branch, edits the API, or merges automatically.
If main moves during the fetch, the job stops before writing a candidate. Retry.

## Setup

Add these **repository secrets** to `OpenStackweb/openstack.org-astro` (the current
refresh workflow does not target a GitHub environment):

- `GATSBY_SOFTWARE_API_BASE_URL`
- `IDP_OAUTH2_TOKEN_URL`
- `SOFTWARE_API_OAUTH2_CLIENT_ID`
- `SOFTWARE_API_OAUTH2_CLIENT_SECRET`
- `SOFTWARE_API_OAUTH2_SCOPES`
- `GATSBY_LEGACY_SOFTWARE_BASE_URL` (the existing `/` mode is supported)

Use the approved read-only service client. Development credentials yield
**development data**, not a production-ready catalogue. Current catalogue still
requires newer release data, reconciliation and production service approval.

Create a fine-grained GitHub token restricted to this repository with **Actions:
read/write** and **Pull requests: read**. Store it as the Cloudflare secret
`SOFTWARE_REFRESH_GITHUB_TOKEN` on `openstack-org-astro`. Do not put it in Tina
content, public variables, or frontend code. This token can dispatch workflows in
this repository; the HTTP endpoint limits its use to this fixed workflow on main.
The existing `EDITORIAL_GITHUB_TOKEN` remains read-only and is not repurposed.

The Worker verifies Tina project membership using `PUBLIC_TINA_CLIENT_ID`, requires
a same-origin POST, rejects unsupported methods and redirects, and returns only
sanitized status data. There is no local authentication bypass. Access to the
review hostname remains protected by Cloudflare Access. Missing configuration
shows an explicit setup message and disables refresh.

The job uses its short-lived `GITHUB_TOKEN` with Contents write, Pull requests write
and Actions write. Repository policy must permit Actions to create PRs. It reads
trusted main code; users cannot submit a repository, branch, endpoint or workflow
as dispatch parameters. The existing protected preview workflow handles build,
validation and preview authorization.

## Failure and recovery

- API/auth/validation failure: existing deployed data remains unchanged; inspect
  the workflow configuration. Missing settings are named without printing values.
- PR creation failure after a branch push: no data is merged. A candidate branch
  may remain for investigation; no automatic deletion is attempted.
- Preview dispatch/build failure: the PR remains pending. Use the existing
  **Build editorial branch preview** workflow with the candidate branch and exact
  head SHA; do not merge an unverified candidate.
- Close an unwanted catalogue PR before requesting a fresh candidate. Closed
  candidate branches are retained; subsequent runs use unique names.
- Panel status errors do not imply the API or publication succeeded. Follow the
  run link. "Snapshot refreshed" dates the data fetch included in this build,
  not the moment it was merged or deployed.

## Verification

Synthetic tests exercise membership/CSRF rejection, missing configuration, fixed
workflow dispatch, duplicate-run/PR blocking, sanitized failures, no-change
comparison, and the real CLI against an isolated Git repository and mocked API.
The CLI check confirms only the five snapshot files change, main remains intact,
a PR and exact-revision preview are requested, failures preserve the snapshot,
and no-change requests create neither a commit nor a PR. No synthetic data is
committed to the actual website catalogue.

Real fetch and hosted request → PR → preview acceptance require the above secrets;
implementation and synthetic checks do not establish production-data acceptance.
