import { reviewHref } from './legacy-routes.js';
// CMS-authored links may use web or email destinations. Keep internal links
// on the current review site through the shared legacy route mapper.
export function contentHref(value) {
  if (typeof value !== 'string' || !value.trim()) return '#';
  try {
    if (
      ['https:', 'http:', 'mailto:'].includes(new URL(value, 'https://www.openstack.org').protocol)
    )
      return reviewHref(value);
  } catch {}
  return '#';
}
