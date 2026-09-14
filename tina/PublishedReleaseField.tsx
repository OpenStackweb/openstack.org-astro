import React, { useEffect, useId, useState } from 'react';
import { publishedReleaseChoices } from './home-release-validation.mjs';
import { latestReleasePath } from '../src/lib/server/latest-release.mjs';

type Choice = { slug: string; title: string; path: string };
// Final Form accepts either an input event or the selected scalar value.
type Props = { input: { name: string; value?: string; onChange: (value: any) => void; onBlur?: () => void; onFocus?: () => void }; field: { label?: string | boolean }; meta?: { error?: string } };

export function PublishedReleaseField({ input, field, meta }: Props) {
  const id = useId();
  const [choices, setChoices] = useState<Choice[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    publishedReleaseChoices().then(rows => { if (active) setChoices(rows); })
      .catch(() => { if (active) setError('Unable to load published announcements. Try again after deployment.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  let selected = '';
  try { selected = latestReleasePath(input.value, choices.map(row => row.slug)); } catch { /* Display the unresolved value without changing it. */ }
  return <div className="mb-6">
    <label htmlFor={id} className="block font-semibold mb-2">{typeof field.label === 'string' ? field.label : 'Latest release announcement'}</label>
    <p className="text-sm text-gray-500 mb-2">Publish the announcement and wait for deployment before selecting it here. This also controls /latest-release/.</p>
    <select id={id} name={input.name} className="block w-full border rounded p-2" disabled={loading || !!error}
      value={selected} onChange={event => input.onChange(event.target.value)} onBlur={input.onBlur} onFocus={input.onFocus}>
      <option value="">{loading ? 'Loading announcements…' : input.value ? `Unavailable selection: ${input.value}` : 'Choose an announcement'}</option>
      {choices.map(choice => <option key={choice.slug} value={choice.path}>{choice.title}</option>)}
    </select>
    <button type="button" className="mt-2 text-sm underline" disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh announcements</button>
    {(error || meta?.error) && <p role="alert" className="text-sm text-red-600 mt-2">{error || meta?.error}</p>}
  </div>;
}
