import React from 'react';

type Statistic = { label?: string; value?: string; [key: string]: unknown };
type Props = {
  input: { value?: unknown; onChange: (value: Statistic[]) => void };
  meta?: { error?: string };
};

// Small editorial lists do not need drag gestures or a nested editor screen.
export function HighlightsStatisticsField({ input, meta }: Props) {
  const rows: Statistic[] = Array.isArray(input.value) ? input.value : [];
  const update = (index: number, key: 'label' | 'value', value: string) =>
    input.onChange(rows.map((row, position) => position === index ? { ...row, [key]: value } : row));
  const move = (index: number, direction: number) => {
    const next = [...rows];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    input.onChange(next);
  };
  return <fieldset className="mb-6">
    <legend className="font-semibold mb-2">Published statistics</legend>
    <p className="text-sm text-gray-500 mb-3">Historical values, displayed in this order. These do not recalculate from the Summit service.</p>
    {meta?.error && <p role="alert" className="text-sm text-red-600">{meta.error}</p>}
    {rows.map((row, index) => <fieldset key={index} className="border rounded p-3 mb-3">
      <legend className="text-sm px-1">Statistic {index + 1}</legend>
      <label className="block text-sm mb-2">Statistic {index + 1} label
        <input className="block w-full border rounded p-2" value={row.label || ''}
          onChange={event => update(index, 'label', event.target.value)} />
      </label>
      <label className="block text-sm mb-3">Statistic {index + 1} value
        <input className="block w-full border rounded p-2" value={row.value || ''}
          onChange={event => update(index, 'value', event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" aria-label={`Move statistic ${index + 1} up`} disabled={index === 0}
          className="border rounded px-2 py-1 disabled:opacity-40" onClick={() => move(index, -1)}>Up</button>
        <button type="button" aria-label={`Move statistic ${index + 1} down`} disabled={index === rows.length - 1}
          className="border rounded px-2 py-1 disabled:opacity-40" onClick={() => move(index, 1)}>Down</button>
        <button type="button" aria-label={`Remove statistic ${index + 1}`} className="border rounded px-2 py-1"
          onClick={() => input.onChange(rows.filter((_, position) => position !== index))}>Remove</button>
      </div>
    </fieldset>)}
    <button type="button" className="border rounded px-3 py-2" disabled={rows.length >= 20}
      onClick={() => input.onChange([...rows, { label: '', value: '' }])}>Add statistic</button>
  </fieldset>;
}
