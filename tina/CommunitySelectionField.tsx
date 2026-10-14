import React, { useId } from 'react';
import projects from '../src/lib/community/projects.json';
import members from '../src/lib/community/members.json';
import organizations from '../src/lib/companies/supporting-organizations.json';

type Props = { input: { name: string; value?: number; onChange: (value: number | undefined) => void }; field: { label?: string | boolean }; meta?: { error?: string } };
function selector(records: { id: number; name: string }[], noun: string) {
  return function CommunitySelection({ input, field, meta }: Props) {
    const id = useId();
    return <div className="mb-6">
      <label htmlFor={id} className="block font-semibold mb-2">{typeof field.label === 'string' ? field.label : noun}</label>
      <select id={id} name={input.name} value={input.value ?? ''} className="block w-full border rounded p-2"
        onChange={event => input.onChange(event.target.value === '' ? undefined : Number(event.target.value))}>
        <option value="">Choose a reviewed {noun.toLowerCase()}</option>
        {[...records].sort((a, b) => a.name.localeCompare(b.name)).map(record => <option key={record.id} value={record.id}>{record.name}</option>)}
      </select>
      {meta?.error && <p role="alert" className="text-sm text-red-600 mt-2">{meta.error}</p>}
    </div>;
  };
}
export const ProjectSelectionField = selector(projects.map(p => ({ id: p.id, name: `${p.code_name} — ${p.name}` })), 'Project');
export const MemberSelectionField = selector(members.map(p => ({ id: p.id, name: [p.first_name, p.last_name].filter(Boolean).join(' ') })), 'Member');
export const DonorSelectionField = selector(organizations.donors, 'Donor');
