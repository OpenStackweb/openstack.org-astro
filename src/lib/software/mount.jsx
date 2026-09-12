import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import SoftwareApp from './SoftwareApp';
export function mount(element, options) {
  const tree = () => <SoftwareApp key={`${options.path}:${options.release?.slug}`} {...options} />;
  const root = options.hydrate ? hydrateRoot(element, tree()) : createRoot(element);
  if (!options.hydrate) root.render(tree());
  return {
    update(next) {
      options = { ...options, ...next };
      root.render(tree());
    },
    destroy() {
      root.unmount();
    },
  };
}
