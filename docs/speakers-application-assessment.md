# Speakers Bureau replacement assessment

Reviewed September 15, 2026. This is a source-backed proposal, not a completed port or a certification of the deployed Summit API.

The Astro route `/community/speakers/` currently displays an application migration notice. A read-only browser visit to production confirmed the directory, alphabetical navigation, free-text search, language/country filters and city/postcode inputs. No contact form, profile update or other production write was submitted.

## What SilverStripe owns

Source: `OpenStackweb/openstack-org`, clean checkout at `2172298743fe807a92758cf307059b69a7dba668`.

| Capability | Source evidence | Migration implication |
| --- | --- | --- |
| Directory eligibility | `speaker_bureau/code/ui/SpeakerListPage.php`: list/results require `PresentationSpeaker.AvailableForBureau=1` and a published presentation as speaker or moderator. | Preserve opt-in and eligibility; a dump of every summit speaker is not equivalent. |
| Search and filters | Same controller joins speaker expertise, languages, country, member, affiliations and organizations; suggestions search names, expertise and company. | Needs service queries and pagination/search design, not CMS JSON fields. |
| Profile URLs | `profile/{ID}/{NameSlug}` and ID-only 301 redirect; ordinary profile lookup requires bureau opt-in, while administrators/track chairs can see other speakers. | Preserve stable ID URLs and explicit permission behavior. Profile lookup has different eligibility rules from directory listing; resolve that deliberately. |
| Profile content | `speaker_bureau/templates/Layout/SpeakerListPage_profile.ss` renders bio/photo, expertise, affiliations, languages, travel preferences, prior talks and member-derived fields. | Assess each field's current visibility policy; do not republish a whole database row as a public DTO. |
| Self-service editing | `registration/code/ui/forms/EditSpeakerProfileForm.php` includes opt-in, bio, travel, languages and expertise; writes speaker relations and can optionally replace member biography. | Keep profile ownership and sign-in in the service layer. Tina should manage surrounding editorial copy only. |
| Contact speaker | `speaker_bureau/_config/routes.yml`, `SpeakerBureauApi.php`, `SpeakerBureauManager.php`: PUT `api/v1/speaker-bureau/email`, CSRF/honeypot checks, server-side recipient lookup, email sending and stored contact result. | Requires a real backend workflow, delivery configuration and abuse controls. A mailto link or an administrator bulk-mail endpoint is not equivalent. |

Source links: [controller](https://github.com/OpenStackweb/openstack-org/blob/2172298743fe807a92758cf307059b69a7dba668/speaker_bureau/code/ui/SpeakerListPage.php), [profile template](https://github.com/OpenStackweb/openstack-org/blob/2172298743fe807a92758cf307059b69a7dba668/speaker_bureau/templates/Layout/SpeakerListPage_profile.ss), [profile editor](https://github.com/OpenStackweb/openstack-org/blob/2172298743fe807a92758cf307059b69a7dba668/registration/code/ui/forms/EditSpeakerProfileForm.php), [contact API](https://github.com/OpenStackweb/openstack-org/blob/2172298743fe807a92758cf307059b69a7dba668/speaker_bureau/code/interfaces/restfull_api/SpeakerBureauApi.php).

## Existing Summit API capability

Source: `OpenStackweb/summit-api`, clean checkout at `67248142a3ceed9c7b3a5301a0cf52da30792469`. Reviewed route/controller/serializer code; no API request or database comparison establishes that the production deployment has this exact revision or the full legacy dataset.

- `routes/api_v1.php` includes global speaker list/detail and `/speakers/me` get/create/update, photo and big-photo routes. Their existence does not establish that our website client has the required scopes or permissions.
- `PresentationSpeakerBaseSerializer.php` includes biography, photos, bureau opt-in and travel/video flags. `PresentationSpeakerSerializer.php` supports expertise, languages, travel preferences and additional relations, with public-profile visibility checks that can suppress fields. Those visibility rules must be respected.
- `OAuth2SummitSpeakersApiController::getAll` uses `ISpeakerFilterFields::GLOBAL_OPERATORS`: IDs, names, email and member identifiers. It does not expose the bureau opt-in, language, expertise, geography or organization filters required by the legacy interface. Published-presentation filtering exists in summit-scoped filters, but is explicitly excluded from the global subset.
- The inspected `routes/public_api.php` global speakers group is not an anonymous global directory endpoint: it has company lookup and edit-permission actions. Public summit-scoped speakers are a different use case.
- The controller's `sendSpeakerEmails` is summit-scoped administrator bulk mail. No equivalent public bureau contact operation was found in the inspected routes/controllers. Do not wire public contact to that privileged feature.

Source links: [routes](https://github.com/OpenStackweb/summit-api/blob/67248142a3ceed9c7b3a5301a0cf52da30792469/routes/api_v1.php), [global filter contract](https://github.com/OpenStackweb/summit-api/blob/67248142a3ceed9c7b3a5301a0cf52da30792469/app/Services/Model/ISpeakerFilterFields.php), [speaker controller](https://github.com/OpenStackweb/summit-api/blob/67248142a3ceed9c7b3a5301a0cf52da30792469/app/Http/Controllers/Apis/Protected/Summit/OAuth2SummitSpeakersApiController.php), [profile serializer](https://github.com/OpenStackweb/summit-api/blob/67248142a3ceed9c7b3a5301a0cf52da30792469/app/ModelSerializers/Summit/Speakers/PresentationSpeakerSerializer.php).

## Selected assessment direction

Assess reuse of Summit API speaker ownership first, with an explicit public bureau read contract and a separately authorized contact operation. Astro can render the directory/profile pages and add client interaction where needed; React is optional. This minimizes duplicate identity/profile records. A dedicated DRF service remains an option if ownership, scaling or product boundaries justify extraction, but it must have an agreed migration/synchronization contract rather than silently copying profiles into Git.

September 15: JP selected **assess Summit API reuse first**. This authorizes further source/data assessment, not backend implementation. Before implementation: verify production data coverage and stable speaker IDs against the local SilverStripe database; decide public-field policy, global eligibility, edit ownership, API scopes and contact delivery. Acceptance must cover alphabetical/search/filter/empty states, profile redirects, opt-out visibility, authorized edit/photo roundtrips, contact validation and delivery in a safe test environment, mobile/keyboard behavior, and metadata/indexing. The review notice stays until the agreed scope is functional.

## Reuse assessment follow-up — September 15

Fresh clean-checkout verification at the revisions above strengthens the reuse option: Summit API's `PresentationSpeaker` entity maps the existing `PresentationSpeaker` table, including `AvailableForBureau`, `Country`, travel flags and `MemberID`; its `PresentationSpeakerAssignment` maps `Presentation_Speakers` with the existing speaker/presentation IDs. This is compatible table naming and relationship ownership, not proof that the deployed API and local dump contain identical records or share a database. No database migration was run.

The global query gap is more than exposing a filter: `ISpeakerFilterFields::GLOBAL_OPERATORS` deliberately excludes published-presentation criteria because the shared repository mappings require a bound summit. A bureau endpoint needs a genuinely global published-presentation query, including moderator eligibility, rather than enabling that filter on the existing global endpoint and triggering an unbound-parameter failure.

Public DTO policy also needs an explicit decision. `PresentationSpeakerSerializer::checkDataPermissions` suppresses bio-related fields/relations, photos and social fields according to profile visibility, and always removes phone numbers. Its full-name restriction is commented out for signage. A bureau contract must not silently inherit signage-oriented exceptions or expose private contact fields. The source supports building on existing records, with dedicated bureau queries and a reviewed public projection; it does not yet prove an unchanged endpoint is sufficient.

Next evidence gate: compare eligible legacy IDs and required field completeness against the actual API dataset using read-only access; verify website client scopes and public visibility behavior. No API changes, profile edits or contact emails were performed during this assessment.

## Local data eligibility and visibility baseline

September15 SELECT-only inspection of the supplied full SilverStripe dump, using the exact SpeakerListPage published-speaker OR published-moderator predicate without its initial-letter filter:14,846 speaker records;3,062 bureau opt-ins;1,414 directory-eligible speakers. Eight qualify only as moderators. The remaining1,648 opted-in speakers can still meet legacy ordinary profile lookup's weaker opt-in-only rule; they do not qualify for the directory. This distinction needs an explicit API contract.

Among the1,414 eligible records:5 have no biography,221 have no speaker PhotoID,15 lack a matching Member,1,355 matching members have PublicProfileShowPhoto=0, and none of the matched members hide biography/full name. These are aggregate dump values, not current API coverage. Missing speaker PhotoID may still have a member photo or legacy Twitter fallback. See speakers-data-coverage.json for scope and limitations.

The photo discrepancy matters: SilverStripe PresentationSpeaker::ProfilePhoto reads the speaker photo, then member photo, then a Twitter fallback without checking the member's public-photo flag. Summit API's isPublicProfileShowPhoto reads the member flag and returns false without a member. Do not silently override those flags or assume the current generic serializer preserves the bureau's historical display. Recommendation for decision: define explicit bureau visibility/consent semantics separately from general member-profile settings; confirm whether existing bureau opt-in covers speaker-photo publication before implementing that projection.

No database rows or personal contact data were exported, no PHP/jobs/network listeners were started, and the isolated MySQL instance was shut down after the read. Live Summit API base URL and read-only client configuration location were requested; data/ID parity remains unverified pending access. Existing source/table compatibility supports reuse assessment but does not replace this gate.

## Editorial deferral — September 15

JP supplied the OAuth-protected route `GET /api/v1/speakers` and selected deferral
pending an editorial decision about retaining the bureau. This supersedes the
pending request for production API access: do not provision credentials or keep
asking for a base URL until the retain/rebuild decision is made.

A fresh read-only production directory visit returned links to profiles 14020,
14755 and 2759; all three GETs returned HTTP404. This confirms the reported problem
for that sample, not every speaker. The preview directory and profile routes now
explain the editorial decision and source-backed service gaps instead of promising
an already-planned port. No API calls with credentials, account provisioning,
profile writes or backend changes were performed.

If retained, assess a dedicated service account with least-privilege read scopes,
OAuth client credentials held as Cloudflare Worker secrets and server-side API
access. Browser code and Git must not receive the credential or access token.
Keep source ownership in Summit API; confirm dataset/ID coverage, bureau opt-in
and public-field visibility before returning public results. Cache only the
approved public projection with a defined opt-out/update policy. A read service
account does not authorize contact emails or profile writes; those remain separate
backend and identity decisions. No exact secret names, base URL or scopes have
been established yet.

Add this to the final Applications & deferred work sheet as an **editorial
retain/retire decision**, with links to production and Astro `/community/speakers/`.
It is not a missing static-content import and not a request to edit individual
speaker records through Tina.
