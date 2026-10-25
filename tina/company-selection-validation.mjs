import companies from '../src/lib/companies/ai-contributors.json' with { type: 'json' };

export function validateCompanySelections(value, reviewedCompanies = companies) {
  if (value == null) return undefined;
  if (!Array.isArray(value)) return 'Choose companies from the reviewed list.';
  const seen = new Set();
  for (const selection of value) {
    const id = selection?.companyId ?? selection?.id;
    const company = reviewedCompanies.find((company) => company.id === id);
    if (!company) return 'Choose a reviewed company for every entry.';
    if (seen.has(id))
      return `${company.name} is selected more than once. Remove the duplicate entry.`;
    seen.add(id);
  }
  return undefined;
}

export function validateAiSubmission(values) {
  const message = validateCompanySelections(values.supportingFoundationMembers?.companies);
  if (message) throw new Error(message);
  return values;
}
