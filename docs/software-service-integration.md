# Software service and visitor-session boundary

Reviewed September15,2026 against Astro92a22df, Software site
`5cfab8dab833689a3b929e5098b0083bbf18c9f3`, Software API
`88616d261949584535f9deffe773a96d7abf8f9b` and SvelteKit migration
`032a17650b000ada14af6e1704d7faf16334c887`. Source evidence is not production-service
configuration or deployed data acceptance.

## Two distinct authentication paths

The Gatsby site's `gatsby-node.js::onPreBootstrap` obtains a client-credentials
token through `src/lib/software-api/oauth2Client.js`, then fetches current-release,
component and mascot data to generated JSON. That token uses client_secret_basic
at the IdP token endpoint. This is a service-account read, not visitor login.

The Astro `SoftwareApp.jsx` renders supplied catalogue data; its interactive
search/category/capability selection is local. It does not currently call an
authenticated service or accept a visitor token. `software-catalogs.js` reads
four service snapshots, including release-specific history and samples. These
are outside Tina's editorial collections. A shared authenticated header therefore
does not demonstrate authenticated Software API operations—and public catalogue
reads do not need to require a visitor to sign in.

The API's `backend/settings.py` configures read/write scopes per endpoint and
the view classes use OAuth2 authentication. Its admin has separate authorization.
Do not infer that the website's member-profile scope grants catalogue or admin
permissions. Keep the existing demonstration admin link explicitly developmental.

## Read-only Astro preparation command

The reviewed SvelteKit service client/projection and its contract tests have been
ported into Astro's `scripts/software-api.mjs`. No runtime browser or build entry
imports this client. Nothing automatically refreshes or replaces the checked-in
snapshots yet.

Set the approved service configuration in the ignored local `.env` or the process
environment (names retained from Gatsby for compatibility):

- `GATSBY_SOFTWARE_API_BASE_URL`
- `IDP_OAUTH2_TOKEN_URL`
- `SOFTWARE_API_OAUTH2_CLIENT_ID`
- `SOFTWARE_API_OAUTH2_CLIENT_SECRET`
- `SOFTWARE_API_OAUTH2_SCOPES`
- `GATSBY_LEGACY_SOFTWARE_BASE_URL` (the existing root-relative `/` mode is supported)

Run `npm run software:check` to validate/fetch current and published historical
catalogues and sample configurations. It requests a service token and issues GET
requests to the Software API; it performs no business-data writes. Summary output
contains counts and publication exclusions, not credentials or raw responses.
Failed requests do not replace the website data. HTTPS endpoint validation,
redirect rejection, timeouts and pagination bounds are retained from the reviewed
client. Public field projection excludes curator contact/private fields.

Run `npm run software:check -- --export` to additionally write a new, ignored
`.software-preview/candidate-*` directory. Its four JSON files match the existing
Astro snapshot shape. A manifest written last records origin, generation time,
byte sizes and SHA-256 values. Only use a candidate after a successful command and
a complete manifest; a failed export may leave an incomplete candidate directory.
The command never writes `src/lib/software/` or changes Tina content.

## Acceptance and next step

Thirteen projection/export-shape tests pass, including historical membership,
secret boundaries, repeated pagination, publication exclusions and sample notes.
The full148-test suite passed before a separate CLI integration test was added;
that additional test also passes. It runs the actual command in a temporary
directory with intercepted synthetic requests, verifies all four output hashes,
checks no synthetic token/private field was retained, and proves a sentinel site
snapshot remains unchanged. Astro check reports zero errors/warnings and two
existing importer hints.

The actual local preflight reports all six service settings absent, before network
access. No production catalogue was fetched or imported. Settings previously
provided to the SvelteKit repository's staging environment do not automatically
exist in this separate Astro repository. Do not silently reuse deployment or
visitor credentials as service-account credentials.

Once the production endpoint, read-only service account and dataset are confirmed:
review a candidate diff against the existing current/history snapshots; validate
release status, category/component coverage, sample configurations and assets;
then decide and configure trusted build refresh and failure behavior. Browser
parity and SEO checks must follow the resulting actual data change. Future
visitor-specific features should consume the shell's session interface only when
their endpoint scopes and authorization are defined. No extra browser token loop
or artificial account widget inside the catalogue is needed now.

## September 27 — Release picker and refresh expectations

JP confirmed production still uses the SilverStripe application pending approval
of the standalone service; the newer service has not been maintained with newer
releases. Hide the Change release picker for now in the React catalogue and Astro
sample configurations. Retain the selected catalogue label and existing explicit
release URLs/query parameters, including historical component membership. This is
presentation cleanup, not a data refresh or certification of current release data.

Current Astro deployment rebuilds bundled snapshots; it does not fetch the API.
An explicit software:check -- --export produces a candidate for review, after which
approved files must replace the bundled snapshots and be committed/deployed.
Proposed production workflow: validated service-account fetch during publishing,
triggered after catalogue updates, failing publication if refresh/validation fails
so the prior deployment remains available. This automation is not implemented yet.
