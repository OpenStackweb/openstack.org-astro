import React, { useEffect, useRef, useState } from 'react';

const PAGE_SIZE = 25;
type Props = {
  input: { value?: string[] | null; onChange: (value: any) => void };
  meta?: { error?: string };
};

/** Ordered editorial credits; paging changes the editor, never the saved list. */
export function ReleaseCreditsField({ input, meta }: Props) {
  const names = input.value ?? [];
  const [requestedPage, setPage] = useState(0);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const inputs = useRef(new Map<number, HTMLInputElement>());
  const pages = Math.max(1, Math.ceil(names.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pages - 1);
  const start = page * PAGE_SIZE;
  useEffect(() => {
    if (focusIndex === null) return;
    inputs.current.get(focusIndex)?.focus();
    setFocusIndex(null);
  }, [focusIndex, page, names.length]);
  const move = (index: number, target: number) => {
    if (target < 0 || target >= names.length) return;
    const next = [...names];
    [next[index], next[target]] = [next[target], next[index]];
    input.onChange(next);
    setPage(Math.floor(target / PAGE_SIZE));
    setFocusIndex(target);
    setMessage(`Credit ${index + 1} moved to position ${target + 1}.`);
  };
  return (
    <fieldset
      className="mb-6"
      style={{ minWidth: 0, maxWidth: '100%', padding: 0, marginInline: 0 }}
    >
      <legend className="font-semibold mb-2">Public contributor credits</legend>
      <p
        style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
        className="text-sm text-gray-500 mb-3"
      >
        Names appear in this order. These credits do not edit member profiles or service statistics.
      </p>
      <p style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }} className="text-sm mb-3">
        {names.length
          ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, names.length)} of ${names.length} credits.`
          : 'No contributor credits.'}
      </p>
      {meta?.error && (
        <p
          role="alert"
          style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
          className="text-sm text-red-600"
        >
          {meta.error}
        </p>
      )}
      {names.slice(start, start + PAGE_SIZE).map((name, offset) => {
        const index = start + offset;
        return (
          <div key={index} className="border rounded p-3 mb-3">
            <label className="block text-sm mb-2">
              Credit {index + 1} name
              <input
                className="block w-full border rounded p-2"
                style={{ minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                value={name}
                maxLength={250}
                ref={(element) => {
                  if (element) inputs.current.set(index, element);
                  else inputs.current.delete(index);
                }}
                onChange={(event) =>
                  input.onChange(
                    names.map((value, i) => (i === index ? event.target.value : value)),
                  )
                }
              />
            </label>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                className="border rounded px-2 py-1 disabled:opacity-40"
                disabled={index === 0}
                aria-label={`Move credit ${index + 1} up`}
                onClick={() => move(index, index - 1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="border rounded px-2 py-1 disabled:opacity-40"
                disabled={index === names.length - 1}
                aria-label={`Move credit ${index + 1} down`}
                onClick={() => move(index, index + 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="border rounded px-2 py-1"
                aria-label={`Remove credit ${index + 1}`}
                onClick={() => {
                  input.onChange(names.filter((_, i) => i !== index));
                  setMessage(`Credit ${index + 1} removed.`);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2 text-sm mb-3">
        <button
          type="button"
          className="border rounded px-2 py-1 disabled:opacity-40"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous credits
        </button>
        <button
          type="button"
          className="border rounded px-2 py-1 disabled:opacity-40"
          disabled={page === pages - 1}
          onClick={() => setPage(page + 1)}
        >
          Next credits
        </button>
        <button
          type="button"
          className="border rounded px-2 py-1 disabled:opacity-40"
          disabled={names.length >= 10000}
          onClick={() => {
            input.onChange([...names, '']);
            setPage(Math.floor(names.length / PAGE_SIZE));
            setFocusIndex(names.length);
          }}
        >
          Add credit
        </button>
      </div>
      <p
        role="status"
        style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
        className="text-sm"
      >
        {message}
      </p>
    </fieldset>
  );
}
