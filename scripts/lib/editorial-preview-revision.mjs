import assert from 'node:assert/strict';

export function verifyEditorialRevision({ branch, sha, head, branchSha, origin, dirty }) {
  assert.match(origin, /^(?:https:\/\/github\.com\/|git@github\.com:)OpenStackweb\/openstack\.org-astro(?:\.git)?$/, 'Only the authorized Astro repository can build editorial previews');
  assert.ok(branch && branch !== 'main', 'Use an editorial branch, not main');
  assert.match(sha, /^[a-f0-9]{40}$/, 'Specify a full commit SHA');
  assert.equal(head, sha, 'Checkout does not match the requested commit');
  assert.equal(branchSha, sha, 'Branch moved or does not match the requested commit');
  assert.equal(dirty, '', 'Preview builds require a clean checkout');
}
