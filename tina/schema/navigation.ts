import type { Collection, TinaField } from 'tinacms';
import { validateNavigation, navigationDestinationError } from '../navigation-validation.mjs';
const itemFields = (depth: number): TinaField[] => [
  { type: 'string', name: 'title', label: 'Label' },
  { type: 'string', name: 'link', label: 'Destination', description: 'Use # for a top-level menu without a landing page. An empty label and destination create a dropdown divider.', ui: { validate: navigationDestinationError } },
  { type: 'boolean', name: 'display', label: 'Display' },
  { type: 'boolean', name: 'requiresAuth', label: 'Legacy authentication flag', ui: { component: () => null } },
  ...(depth < 2 ? [{ type: 'object', name: 'items', label: depth === 0 ? 'Dropdown entries' : 'Preserved legacy nested entries', list: true,
    ui: depth === 0 ? { itemProps: (item: any) => ({ label: item.title || 'Divider' }), defaultItem: { display: true, requiresAuth: false } } : { component: () => null },
    fields: itemFields(depth + 1),
  } as TinaField] : []),
];
export const navigation: Collection = {
  name: 'navigation', label: 'Global — navigation', path: 'src/lib/content', match: { include: 'navbar' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/cms-preview/navigation/', beforeSubmit: ({ values }) => validateNavigation(values) },
  fields: [{ type: 'object', name: 'items', label: 'Main navigation', list: true,
    ui: { itemProps: item => ({ label: item.title || 'Navigation item' }), defaultItem: { display: true, requiresAuth: false } }, fields: itemFields(0) }],
};
