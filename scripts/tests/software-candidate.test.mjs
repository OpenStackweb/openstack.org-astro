import test from 'node:test';
import assert from 'node:assert/strict';
import { softwareCandidateFiles } from '../lib/software-candidate.mjs';

test('Candidate export preserves release-specific memberships in the existing Astro snapshot shape', () => {
  const currentCatalog = [{ components: [{ id: 1 }] }];
  const olderCatalog = [{ components: [{ id: 2 }] }];
  const result = softwareCandidateFiles({
    catalog: currentCatalog, release: { id: 3, name: 'Current' },
    samples: [{ id: 1, configurations: [] }, { id: 2, configurations: [{ id: 20 }] }],
    history: [{ release: { id: 4, name: 'Older' }, catalog: olderCatalog, samples: [] }],
  });
  assert.deepEqual(Object.keys(result).sort(), ['catalog-release.json', 'catalog.json', 'release-history.json', 'sample-configurations.json']);
  assert.equal(result['catalog.json'], currentCatalog);
  assert.equal(result['catalog-release.json'].slug, 'current');
  assert.equal(result['catalog-release.json'].source, 'software-api');
  assert.deepEqual(result['sample-configurations.json'].types.map(type => type.id), [2]);
  assert.equal(result['release-history.json'][0].catalog, olderCatalog);
  assert.equal(result['release-history.json'][0].release.slug, 'older');
  assert.deepEqual(result['release-history.json'][0].samples, []);
});

test('Candidate export rejects a partial fetch rather than replacing history or samples with defaults', () => {
  assert.throws(() => softwareCandidateFiles({ catalog: [{}], release: { name: 'Current' }, samples: [] }), /complete/);
});
