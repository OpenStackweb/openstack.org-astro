import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const state = process.argv[2];
assert.ok(['pending','success','failure'].includes(state));
const revision = process.env.EDITORIAL_REVISION;
assert.match(revision || '', /^[a-f0-9]{40}$/);
assert.ok(process.env.GH_TOKEN, 'GitHub status token is required');
let target = `https://github.com/OpenStackweb/openstack.org-astro/actions/runs/${process.env.GITHUB_RUN_ID}`;
assert.match(process.env.GITHUB_RUN_ID || '', /^\d+$/);
if (state === 'success') {
  const result = JSON.parse(readFileSync('dist/editorial-publication.json'));
  assert.equal(result.revision, revision);
  assert.equal(result.branch, process.env.EDITORIAL_BRANCH);
  assert.match(result.url, /^https:\/\/[a-f0-9]{8}-openstack-org-astro-editorial\.openstack-review\.workers\.dev$/);
  target = result.url;
}
const descriptions = {pending:'Building protected editorial preview',success:'Protected preview ready for this revision',failure:'Editorial preview did not pass; inspect the build'};
const response = await fetch(`https://api.github.com/repos/OpenStackweb/openstack.org-astro/statuses/${revision}`, {
  method:'POST', headers:{Authorization:`Bearer ${process.env.GH_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'OpenStack-editorial-preview'},
  body:JSON.stringify({state,context:'OpenStack editorial preview',target_url:target,description:descriptions[state]}),
  signal:AbortSignal.timeout(20000),
});
assert.ok(response.ok, `GitHub status publication failed (${response.status})`);
console.log(`Recorded ${state} preview status for ${revision}`);
