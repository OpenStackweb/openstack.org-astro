import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareOpenstackForAi } from '../../src/lib/server/openstack-for-ai.mjs';
const raw = JSON.parse(
  readFileSync(new URL('../../src/lib/content/openstack-for-ai.json', import.meta.url), 'utf8'),
);
const companies = JSON.parse(
  readFileSync(new URL('../../src/lib/companies/ai-contributors.json', import.meta.url), 'utf8'),
);
test('AI contributor aliases retain the original service projection and support reordered selections', () => {
  const aliased = structuredClone(raw);
  aliased.supportingFoundationMembers.companies = raw.supportingFoundationMembers.companies.map(
    ({ id }) => ({ companyId: id }),
  );
  assert.deepEqual(prepareOpenstackForAi(aliased), prepareOpenstackForAi(raw));
  aliased.supportingFoundationMembers.companies.reverse();
  assert.deepEqual(
    prepareOpenstackForAi(aliased).supportingFoundationMembers.companies.map((c) => c.id),
    raw.supportingFoundationMembers.companies.map((c) => c.id).reverse(),
  );
  for (const company of prepareOpenstackForAi(aliased).supportingFoundationMembers.companies) {
    const original = companies.find((c) => c.id === company.id);
    assert.equal(company.name, original.name);
  }
});
test('AI editor cannot turn unknown or duplicate contributor IDs into company records', () => {
  const draft = structuredClone(raw);
  draft.supportingFoundationMembers.companies = [{ companyId: -1 }];
  assert.throws(() => prepareOpenstackForAi(draft), /reviewed service snapshot/);
  draft.supportingFoundationMembers.companies = [
    { companyId: companies[0].id },
    { companyId: companies[0].id },
  ];
  assert.throws(() => prepareOpenstackForAi(draft), /must not be repeated/);
});

// Validate the save boundary as well as the renderer: rejecting invalid data
// only when rendering would still allow a broken document into Git.
test('Contributor form validation rejects incomplete, unknown and duplicate selections', async () => {
  const { validateCompanySelections } = await import('../../tina/company-selection-validation.mjs');
  assert.equal(validateCompanySelections(raw.supportingFoundationMembers.companies), undefined);
  assert.equal(validateCompanySelections(companies.map((c) => ({ companyId: c.id }))), undefined);
  assert.match(validateCompanySelections([{}]), /every entry/);
  assert.match(validateCompanySelections([{ companyId: -1 }]), /every entry/);
  assert.match(
    validateCompanySelections([{ companyId: companies[0].id }, { companyId: companies[0].id }]),
    /more than once/,
  );
  assert.equal(validateCompanySelections([]), undefined);
});

test('AI before-submit validation rejects a duplicate regardless of the active form field', async () => {
  const { validateAiSubmission } = await import('../../tina/company-selection-validation.mjs');
  assert.equal(validateAiSubmission(raw), raw);
  const draft = structuredClone(raw);
  draft.supportingFoundationMembers.companies[0] = {
    companyId: draft.supportingFoundationMembers.companies[1].id,
  };
  assert.throws(() => validateAiSubmission(draft), /more than once/);
});

test('An intentionally empty contributor list remains renderable if Tina omits the optional list', () => {
  const draft = structuredClone(raw);
  delete draft.supportingFoundationMembers.companies;
  assert.deepEqual(prepareOpenstackForAi(draft).supportingFoundationMembers.companies, []);
});
