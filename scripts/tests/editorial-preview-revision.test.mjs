import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyEditorialRevision } from '../lib/editorial-preview-revision.mjs';
const sha = 'a'.repeat(40);
const valid = { branch: 'cms/trial', sha, head: sha, branchSha: sha, origin: 'git@github.com:OpenStackweb/openstack.org-astro.git', dirty: '' };
test('accepts a clean exact revision from the authorized repository', () => {
  assert.doesNotThrow(() => verifyEditorialRevision(valid));
  assert.doesNotThrow(() => verifyEditorialRevision({ ...valid, origin: 'https://github.com/OpenStackweb/openstack.org-astro.git' }));
});
test('rejects a fork, dirty checkout, main or mismatched requested revision', () => {
  for (const override of [
    { origin: 'https://github.com/other/openstack.org-astro.git' },
    { origin: 'https://github.com/OpenStackweb/openstack.org-astro.evil' },
    { dirty: ' M src/lib/content/home.json' }, { branch: 'main' },
    { sha: 'aaaaaaa' }, { head: 'b'.repeat(40) }, { branchSha: 'b'.repeat(40) },
  ]) assert.throws(() => verifyEditorialRevision({ ...valid, ...override }));
});
