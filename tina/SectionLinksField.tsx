import React from 'react';

type Link = { label: string; url: string };
type Props = {
  // Tina's custom object-list API uses a generic field value/setter.
  input: { value?: unknown; onChange: (value: any) => void };
  field: { label?: string | boolean };
  meta?: { error?: string };
  form?: { getState: () => { values: { archiveEvent?: string } } };
};

export function validateSectionLinks(value: unknown) {
  if (!value) return;
  if (!Array.isArray(value) || value.length > 30) return 'Use at most 30 section links.';
  for (const link of value) {
    if (!link || typeof link.label !== 'string' || !link.label.trim() || link.label.length > 250) return 'Each link needs text of at most 250 characters.';
    try {
      const url = new URL(link.url, 'https://www.openstack.org/');
      if (!link.url?.trim() || !['https:', 'http:'].includes(url.protocol) || url.username || url.password)
        return 'Use a website URL or a path such as /community/.';
    } catch { return 'Use a valid link destination.'; }
  }
}

// Keep simple link editing in the parent form. Tina 3.13 can retain a stale
// nested item path when Reset removes a newly added object-list item.
export function SectionLinksField({ input, field, meta, form }: Props) {
  if (form?.getState().values.archiveEvent) {
    return <p className="text-sm text-gray-500 mb-6">This page uses shared event navigation, introduction and resources. Edit them in “Shared — archived event content”; changes apply to all pages linked to that event.</p>;
  }
  const links: Link[] = Array.isArray(input.value) ? input.value : [];
  const update = (index: number, key: keyof Link, value: string) =>
    input.onChange(links.map((link, position) => position === index ? { ...link, [key]: value } : link));
  const move = (index: number, direction: number) => {
    const next = [...links];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    input.onChange(next);
  };
  return <fieldset className="mb-6">
    <legend className="font-semibold mb-2">{field.label || 'Section links'}</legend>
    <p className="text-sm text-gray-500 mb-3">Links shown beside this page, in this order.</p>
    {meta?.error && <p role="alert" className="text-sm text-red-600 mb-3">{meta.error}</p>}
    {links.map((link, index) => <fieldset key={index} className="border rounded p-3 mb-3">
      <legend className="text-sm px-1">Link {index + 1}</legend>
      <label className="block text-sm mb-2">Link {index + 1} text
        <input className="block w-full border rounded p-2" value={link.label || ''}
          onChange={(event) => update(index, 'label', event.target.value)} />
      </label>
      <label className="block text-sm mb-3">Link {index + 1} destination
        <input className="block w-full border rounded p-2" value={link.url || ''}
          onChange={(event) => update(index, 'url', event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)}
          aria-label={`Move link ${index + 1} up`} className="border rounded px-2 py-1 disabled:opacity-40">Up</button>
        <button type="button" disabled={index === links.length - 1} onClick={() => move(index, 1)}
          aria-label={`Move link ${index + 1} down`} className="border rounded px-2 py-1 disabled:opacity-40">Down</button>
        <button type="button" onClick={() => input.onChange(links.filter((_, position) => position !== index))}
          aria-label={`Remove link ${index + 1}`} className="border rounded px-2 py-1">Remove</button>
      </div>
    </fieldset>)}
    <button type="button" disabled={links.length >= 30} className="border rounded px-3 py-2 text-sm"
      onClick={() => input.onChange([...links, { label: 'New link', url: '/' }])}>Add section link</button>
  </fieldset>;
}
