import React, { useId } from 'react';
import aiCompanies from '../src/lib/companies/ai-contributors.json';
import vmwareCompanies from '../src/lib/companies/vmware-members.json';

type Props = {
  input: { name: string; value?: number; onChange: (value: any) => void };
  field: { label?: string | boolean };
  meta?: { error?: string };
};
/** Preserve numeric service identifiers while showing names to editors. */
function createCompanySelectionField(companies: { id: number; name: string }[]) {
  return function CompanySelection({ input, field, meta }: Props) {
    const id = useId();
    return (
      <div className="mb-6">
        <label htmlFor={id} className="block font-semibold mb-2">
          {typeof field.label === 'string' ? field.label : 'Company'}
        </label>
        <select
          id={id}
          name={input.name}
          value={input.value ?? ''}
          className="block w-full border rounded p-2"
          onChange={(event) =>
            input.onChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
        >
          <option value="">Choose a reviewed company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {meta?.error && (
          <p role="alert" className="text-sm text-red-600 mt-2">
            {meta.error}
          </p>
        )}
      </div>
    );
  };
}

export const CompanySelectionField = createCompanySelectionField(aiCompanies);
export const VmwareCompanySelectionField = createCompanySelectionField(vmwareCompanies);
