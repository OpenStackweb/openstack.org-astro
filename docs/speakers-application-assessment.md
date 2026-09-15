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
