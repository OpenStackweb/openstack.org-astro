# Member affiliation management

October22,2026 candidate: `/profile/` adds list/add/edit/delete controls using the
existing Summit `/api/v1/members/me/affiliations` endpoints. The public OpenStack.org
OIDC client requests `members/write/me` alongside existing `members/read/me`.
The shared client1916 already showed both scopes allowed in OpenInfraID; no
registration change was made. Existing tokens may need a fresh sign-in and consent.
No Summit code or database schema change is included.

Requests use the coordinated signed-in browser access token and a fixed independent
Summit host. No arbitrary member ID is accepted. Profile data is browser-only,
private/no-store, projected to the fields required by the view and rendered with
textContent. Identity/session changes clear private controls, and late responses
cannot overwrite another account or sign out a newer session. Expired authorization
shows a fresh sign-in link. New profile controls follow the existing Astro browser
OAuth architecture; Survey's separately retained token stays in its server session.

Organization, title, current/history dates can be edited. Current affiliations
omit an end date; ending an affiliation requires an end after its start. Delete
asks the member to confirm. The source API enforces owner membership for edits and
deletes. A failed/ambiguous write asks the member to reload before retrying because
an interrupted POST may already have succeeded. Historical duplicates are not
bulk-cleaned.

The Survey gateway separately permits only POST on the exact owner-response
`/api/v1/responses/{id}/affiliation` retry route. Django independently verifies its
session, CSRF and response owner. It is not a generic member API proxy.

Synthetic desktop and390px iframe review in Safari used the actual component with
a local mock transport: list, long names, edit and successful save were checked.
These fixtures made no real member writes. Node tests cover payload/date validation,
fixed own-member paths, late success/401 after account switches, incomplete reads
and the POST-only gateway. Live user consent/read/write acceptance remains distinct.
