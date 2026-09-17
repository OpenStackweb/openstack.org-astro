import { reviewHref } from '../legacy-routes.js';
export function marketplaceHref(value) {
  if (typeof value !== 'string' || !value.trim()) return '#';
  try {
    if (
      ['https:', 'http:', 'mailto:'].includes(new URL(value, 'https://www.openstack.org').protocol)
    )
      return reviewHref(value);
  } catch {}
  return '#';
}
