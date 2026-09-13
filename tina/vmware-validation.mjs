import companies from '../src/lib/companies/vmware-members.json' with { type: 'json' };
import { validateCompanySelections } from './company-selection-validation.mjs';
export const validateVmwareCompanies = value => validateCompanySelections(value, companies);
export function validateVmwareSubmission(values) {
  const message = validateVmwareCompanies(values.supportingFoundationMembers?.companies);
  if (message) throw new Error(message);
  for (const field of ['requestMetric', 'successMetric']) {
    const value = values.migrationGuide?.rightColumn?.[field]?.percentage;
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error('Survey percentages must be between 0 and 100.');
  }
  const features = values.migrationFeatures?.features ?? [];
  if (!Array.isArray(features) || features.some(f => !['Openstack', 'VMWare'].includes(f.type))) throw new Error('Choose an OpenStack or VMware column for each comparison feature.');
  return values;
}
