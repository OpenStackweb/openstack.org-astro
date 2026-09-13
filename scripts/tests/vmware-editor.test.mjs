import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareVmwareMigration } from '../../src/lib/server/vmware-migration.mjs';
import { validateVmwareSubmission } from '../../tina/vmware-validation.mjs';
const raw = JSON.parse(readFileSync(new URL('../../src/lib/content/vmware-migration.json', import.meta.url), 'utf8'));
test('VMware editor preserves service references, comparison rows, source links and metrics', () => {
  const draft = structuredClone(raw);
  draft.supportingFoundationMembers.companies = draft.supportingFoundationMembers.companies.map(({ id }) => ({ companyId: id }));
  assert.deepEqual(prepareVmwareMigration(draft), prepareVmwareMigration(raw));
  assert.equal(validateVmwareSubmission(draft), draft);
  draft.migrationFeatures.features.reverse();
  const page = prepareVmwareMigration(draft);
  const expected = draft.migrationFeatures.features.filter(f => f.type === 'Openstack').map(f => f.title);
  assert.deepEqual(page.migrationFeatures.rows.map(row => row[0]?.title).filter(Boolean), expected);
  assert.deepEqual(page.migrationGuide, prepareVmwareMigration(raw).migrationGuide);
});
test('VMware submit validation blocks invalid survey percentages, column names and contributor duplicates', () => {
  for (const percentage of [-1, 101, null]) {
    const draft = structuredClone(raw); draft.migrationGuide.rightColumn.requestMetric.percentage = percentage;
    assert.throws(() => validateVmwareSubmission(draft), /between 0 and 100/);
  }
  const draft = structuredClone(raw); draft.migrationFeatures.features[0].type = 'Other';
  assert.throws(() => validateVmwareSubmission(draft), /column/);
  const duplicate = structuredClone(raw); duplicate.supportingFoundationMembers.companies.push(duplicate.supportingFoundationMembers.companies[0]);
  assert.throws(() => validateVmwareSubmission(duplicate), /more than once/);
});
