import { contentDescription } from './content-description.mjs';

// Use a legible symbol for compact unfurls; editorial images retain their card type.
export function socialPreview({ title, description, image, imageAlt, card = 'summary' }) {
  const isDefault = !image || image === '/images/social/openstack.png';
  const cleanTitle = contentDescription(title || 'OpenStack', '/')
    .replace(/\s*\|\s*OpenStack\s*$/i, '') || 'OpenStack';
  const summary = contentDescription(description || '', '/');
  return {
    title: cleanTitle,
    description: summary.length > 160
      ? summary.slice(0, 160).replace(/\s+\S*$/, '').replace(/[.…]+$/, '') + '…'
      : summary,
    image: isDefault ? '/images/social/openstack-symbol-v1.png' : image,
    imageAlt: isDefault ? 'OpenStack' : imageAlt,
    card: isDefault ? 'summary' : card,
    isDefault,
  };
}
