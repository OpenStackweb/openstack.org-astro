import React, { useId } from 'react';
import companies from '../src/lib/companies/ai-contributors.json';

type Props = { input: { name: string; value?: number; onChange: (value: any) => void }; field: { label?: string | boolean } };
/** Preserve numeric service identifiers while showing names to editors. */
export function CompanySelectionField({ input, field }: Props) {
  const id = useId();
  return <div className="mb-6">
    <label htmlFor={id} className="block font-semibold mb-2">{typeof field.label === 'string' ? field.label : 'Company'}</label>
    <select id={id} name={input.name} value={input.value ?? ''} className="block w-full border rounded p-2"
      onChange={event => input.onChange(event.target.value === '' ? undefined : Number(event.target.value))}>
      <option value="">Choose a reviewed company</option>
      {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
    </select>
  </div>;
}
