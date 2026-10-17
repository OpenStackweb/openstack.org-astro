# Search suggestions candidate

Restores the preserved header/search-page suggestion work on the current release
candidate, rather than replacing newer identity, Survey or Tina configuration.
Source parity evidence: `openstack-search-widget` commit
`086fafc4ae59dd745fb8f853402acb3f148722bd`, `app/app.js` lines 130–139:
500 ms delayed suggestions use the existing www-openstack context and map
`results[].term`/`payload` to page title/link. Gateway source at
`43394d495fdcdb378e244954dfba7ca4633075de` maps Solr suggestions. This is source
contract evidence; deployed crawler/index ownership and freshness remain open.

The native component debounces input after two characters, cancels prior requests,
rejects stale responses, provides a live status and Down/Escape/focus behavior,
and retains the ordinary form when suggestions fail or JavaScript is unavailable.
The same-origin API forwards no visitor cookies or credentials, follows no
upstream redirects, bounds JSON response bytes/time, sanitizes titles/destinations,
deduplicates and returns at most six results. Responses use no-store. It does not
add a search backend, replace source ownership or invoke production query probes.

This draft has no browser/visual acceptance yet. Before release, inspect header
and search-page desktop/mobile layout, panel placement/overflow, keyboard order,
Escape and blur dismissal, pointer selection, rapid input/stale cancellation,
empty/error state and ordinary form submission. Verify shared navigation consumers
and an approved isolated search context. The separate deployed crawler/index and
publish/update/delete/draft-exclusion rehearsal gates are still required.

Local acceptance October 17: 244 Node tests pass; Astro check has zero errors,
zero warnings and four existing hints; full review build passes. Four actual
local Worker HTTP checks verify root/search suggestion forms, unique IDs, and
empty/one-character API results with no-store. No nonempty production query was
sent. These checks do not execute browser JavaScript or prove visual/keyboard
fidelity. Safari still returns cgWindowNotFound.
