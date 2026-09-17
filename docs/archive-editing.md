# Editing historical sponsor and venue pages

Decision approved by JP on September 14, 2026: the original 27 rarely edited archives are intentionally maintained directly in Git. Their absence from Tina is not a CMS migration blocker. Current-event services and future API integrations remain separate decisions.

Edit the linked JSON in GitHub or a local checkout. Preserve `path`, IDs, object keys and array structure; change the relevant text, URL or list item. `body` may contain HTML; `locations`, `venueLinks` and `sponsors` contain structured rendering data. Use existing approved `/assets/` or `/cms-media/` URLs for media, rather than placing binaries in Git. Never add credentials or unpublished personal data.

Validate JSON and run the normal build/checks. A commit to this repository triggers the protected Astro deployment; inspect that page after the successful build. Git history provides the rollback. This does not publish to the existing production site.

| Archive path | Git content file |
| --- | --- |
| `/summit/2020/sponsors/` | [2020-sponsors.json](../src/lib/content/pages/2020-sponsors.json) |
| `/summit/austin-2016/sponsors/` | [austin-2016-sponsors.json](../src/lib/content/pages/austin-2016-sponsors.json) |
| `/summit/austin-2016/venues/` | [austin-2016-venues.json](../src/lib/content/pages/austin-2016-venues.json) |
| `/summit/barcelona-2016/sponsors/` | [barcelona-2016-sponsors.json](../src/lib/content/pages/barcelona-2016-sponsors.json) |
| `/summit/barcelona-2016/travel/` | [barcelona-2016-travel.json](../src/lib/content/pages/barcelona-2016-travel.json) |
| `/summit/barcelona-2016/venues/` | [barcelona-2016-venues.json](../src/lib/content/pages/barcelona-2016-venues.json) |
| `/summit/berlin-2018/travel/` | [berlin-2018-travel.json](../src/lib/content/pages/berlin-2018-travel.json) |
| `/summit/boston-2017/sponsors/` | [boston-2017-sponsors.json](../src/lib/content/pages/boston-2017-sponsors.json) |
| `/summit/boston-2017/travel/` | [boston-2017-travel.json](../src/lib/content/pages/boston-2017-travel.json) |
| `/summit/boston-2017/venues/` | [boston-2017-venues.json](../src/lib/content/pages/boston-2017-venues.json) |
| `/summit/denver-2019/sponsors/` | [denver-2019-sponsors.json](../src/lib/content/pages/denver-2019-sponsors.json) |
| `/summit/denver-2019/travel/` | [denver-2019-travel.json](../src/lib/content/pages/denver-2019-travel.json) |
| `/summit/denver-2019/venues/` | [denver-2019-venues.json](../src/lib/content/pages/denver-2019-venues.json) |
| `/summit/shanghai-2019/sponsors/` | [shanghai-2019-sponsors.json](../src/lib/content/pages/shanghai-2019-sponsors.json) |
| `/summit/shanghai-2019/travel/` | [shanghai-2019-travel.json](../src/lib/content/pages/shanghai-2019-travel.json) |
| `/summit/shanghai-2019/venues/` | [shanghai-2019-venues.json](../src/lib/content/pages/shanghai-2019-venues.json) |
| `/summit/sydney-2017/sponsors/` | [sydney-2017-sponsors.json](../src/lib/content/pages/sydney-2017-sponsors.json) |
| `/summit/sydney-2017/travel/` | [sydney-2017-travel.json](../src/lib/content/pages/sydney-2017-travel.json) |
| `/summit/sydney-2017/venues/` | [sydney-2017-venues.json](../src/lib/content/pages/sydney-2017-venues.json) |
| `/summit/tokyo-2015/sponsors/` | [tokyo-2015-sponsors.json](../src/lib/content/pages/tokyo-2015-sponsors.json) |
| `/summit/tokyo-2015/tokyo-and-travel/` | [tokyo-2015-tokyo-and-travel.json](../src/lib/content/pages/tokyo-2015-tokyo-and-travel.json) |
| `/summit/vancouver-2015/about-vancouver/` | [vancouver-2015-about-vancouver.json](../src/lib/content/pages/vancouver-2015-about-vancouver.json) |
| `/summit/vancouver-2015/sponsors/` | [vancouver-2015-sponsors.json](../src/lib/content/pages/vancouver-2015-sponsors.json) |
| `/summit/vancouver-2018/sponsors/` | [vancouver-2018-sponsors.json](../src/lib/content/pages/vancouver-2018-sponsors.json) |
| `/summit/vancouver-2018/travel/` | [vancouver-2018-travel.json](../src/lib/content/pages/vancouver-2018-travel.json) |
| `/summit/vancouver-2018/venues-2/` | [vancouver-2018-venues-2.json](../src/lib/content/pages/vancouver-2018-venues-2.json) |
| `/summit/vancouver-2018/venues/` | [vancouver-2018-venues.json](../src/lib/content/pages/vancouver-2018-venues.json) |

September 15: JP also approved preserving these four relational sponsor listings
as dated Git archives. They add to the original 27 sponsor/venue archives. The
company service remains the owner of current sponsorship management. Empty
`image` or `url` values deliberately render a sponsor name or unlinked logo; do
not invent a destination or omit that sponsor.

| Archive path | Git content file |
| --- | --- |
| `/summit/openstack-paris-summit-2014/sponsors/` | [openstack-paris-summit-2014-sponsors.json](../src/lib/content/pages/openstack-paris-summit-2014-sponsors.json) |
| `/summit/openstack-summit-atlanta-2014/sponsors/` | [openstack-summit-atlanta-2014-sponsors.json](../src/lib/content/pages/openstack-summit-atlanta-2014-sponsors.json) |
| `/summit/openstack-summit-hong-kong-2013/sponsors/` | [openstack-summit-hong-kong-2013-sponsors.json](../src/lib/content/pages/openstack-summit-hong-kong-2013-sponsors.json) |
| `/summit/vancouver-2015/sponsor-logos/` | [vancouver-2015-sponsor-logos.json](../src/lib/content/pages/vancouver-2015-sponsor-logos.json) |

## Historical election introductions

JP approved preserving public election copy as dated Git archives on September 17. These records contain published introductory copy only. Do not add candidate submissions, voter lists, ballots, membership exports or administration to these files. Candidate links lead to deferred workflow notices; old participation instructions are historical.

| Archive path | Git content file |
| --- | --- |
| `/election/2013-board-election/` | [election-2013-board-election.json](../src/lib/content/pages/election-2013-board-election.json) |
| `/election/2014-individual-director-election/` | [election-2014-individual-director-election.json](../src/lib/content/pages/election-2014-individual-director-election.json) |
| `/election/2015-individual-director-election/` | [election-2015-individual-director-election.json](../src/lib/content/pages/election-2015-individual-director-election.json) |
| `/election/2016-individual-director-election/` | [election-2016-individual-director-election.json](../src/lib/content/pages/election-2016-individual-director-election.json) |
| `/election/2017-individual-director-election/` | [election-2017-individual-director-election.json](../src/lib/content/pages/election-2017-individual-director-election.json) |
| `/election/2018-individual-director-election/` | [election-2018-individual-director-election.json](../src/lib/content/pages/election-2018-individual-director-election.json) |
| `/election/2019-individual-director-election/` | [election-2019-individual-director-election.json](../src/lib/content/pages/election-2019-individual-director-election.json) |
| `/election/2023-individual-director-election/` | [election-2023-individual-director-election.json](../src/lib/content/pages/election-2023-individual-director-election.json) |
| `/election/2021-individual-director-election/` | [election-2021-individual-director-election.json](../src/lib/content/pages/election-2021-individual-director-election.json) |

## Closed Summit workflow archives — September 17

JP approved preserving historical public guidance and closing old submission,
voting and review actions. Nine JSON archives are Git-managed; they contain no
proposal lists, votes, member schedules, feedback records or legal agreements.
Keep the closure notice when editing historical wording. Future event workflows
belong to their owning service, not these archive pages.

- `/summit/tokyo-2015/call-for-speakers/`: [tokyo-2015-call-for-speakers-archive.json](../src/lib/content/pages/tokyo-2015-call-for-speakers-archive.json)
- `/summit/boston-2017/call-for-presentations/`: [boston-2017-call-for-presentations-archive.json](../src/lib/content/pages/boston-2017-call-for-presentations-archive.json)
- `/summit/sydney-2017/call-for-presentations/`: [sydney-2017-call-for-presentations-archive.json](../src/lib/content/pages/sydney-2017-call-for-presentations-archive.json)
- `/summit/berlin-2018/call-for-presentations/`: [berlin-2018-call-for-presentations-archive.json](../src/lib/content/pages/berlin-2018-call-for-presentations-archive.json)
- `/summit/2020/vote-for-presentations/`: [2020-vote-for-presentations-archive.json](../src/lib/content/pages/2020-vote-for-presentations-archive.json)
- `/summit/shanghai-2019/vote-for-speakers/`: [shanghai-2019-vote-for-speakers-archive.json](../src/lib/content/pages/shanghai-2019-vote-for-speakers-archive.json)
- `/summit/berlin-2018/vote-for-speakers/`: [berlin-2018-vote-for-speakers-archive.json](../src/lib/content/pages/berlin-2018-vote-for-speakers-archive.json)
- `/summit/austin-2016/review/`: [austin-2016-review-archive.json](../src/lib/content/pages/austin-2016-review-archive.json)
- `/summit/barcelona-2016/review/`: [barcelona-2016-review-archive.json](../src/lib/content/pages/barcelona-2016-review-archive.json)

Source provenance: SilverStripe commit `2172298743fe807a92758cf307059b69a7dba668`.
Four CFP records preserve only `PresentationPage_Live.PresentationDeadlineText`
for IDs 2574, 2795, 2855 and 3019 from the supplied local database snapshot.
Voting pages summarize `summit-voting-app/ui/source/js/components/views/PresentationNotices.js`
and `components/containers/VotingBar.js`; these describe the old interface, not
an exported vote tally or proof that the planned 2020 event occurred. Review pages
quote the generic attendee guidance in `summit/templates/Layout/SummitAppReviewPage.ss`.
The template's member schedule and feedback are excluded, as is its stale
Austin-specific account-linking fallback on the Barcelona route. No live voting
controller was requested: its initialization can modify voting lists.
