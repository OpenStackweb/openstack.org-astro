import React, { useId } from 'react';

type Props = {
  // Tina's Final Form handler accepts either an event or a direct field value.
  input: { name: string; value?: string; onChange: (value: any) => void; onBlur?: () => void; onFocus?: () => void };
  field: { label?: string | boolean; description?: string };
  meta?: { error?: string };
};

/** Optional editorial copy can be cleared explicitly, then saved or reset. */
export function OptionalTextField({ input, field, meta }: Props) {
  const id = useId();
  const label = typeof field.label === 'string' ? field.label : input.name;
  return <div className="mb-6">
    <label htmlFor={id} className="block font-semibold mb-2">{label}</label>
    {field.description && <p className="text-sm text-gray-500 mb-2">{field.description}</p>}
    <textarea id={id} name={input.name} rows={5}
      className="block w-full border rounded p-2" value={input.value ?? ''}
      onChange={event => input.onChange(event.target.value)}
      onBlur={input.onBlur} onFocus={input.onFocus} />
    <button type="button" className="mt-2 text-sm underline disabled:opacity-50"
      disabled={!input.value} onClick={() => input.onChange('')}>
      Clear {label.toLowerCase()}
    </button>
    {meta?.error && <p role="alert" className="text-sm text-red-600 mt-2">{meta.error}</p>}
  </div>;
}
