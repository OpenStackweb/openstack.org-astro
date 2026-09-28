import React, { useEffect, useState } from 'react';
import defaultLabels from '$lib/content/software-details.json';
import ComponentDetails from './ComponentDetails';
import { OpenstackComponents } from './components';
import { flatten, catalogSections, componentGroups, catalogSelection } from './catalog.mjs';
import { capabilityGroups } from './detail-links.mjs';
export { flatten } from './catalog.mjs';
/** @param {{catalog: any[], path?: string, initialHash?: string, release: any, labels?: any, descriptionHtml?: string}} props */
export default function SoftwareApp({
  catalog,
  path = '/software/',
  initialHash = '',
  release,
  labels = defaultLabels,
  descriptionHtml = '',
}) {
  const catalogLink = (path) =>
    release?.slug ? `${path}?release=${encodeURIComponent(release.slug)}` : path;
  const detailMatch = path.match(/\/releases\/([^/]+)\/components\/([^/]+)/);
  const component = detailMatch
    ? flatten(catalog).find(
        (c) =>
          c.code_name.toLowerCase() === detailMatch[2].toLowerCase() &&
          c.href.toLowerCase().includes('/releases/' + detailMatch[1].toLowerCase() + '/'),
      )
    : null;
  const rootSlug =
    path.match(/project-navigator\/([^/]+)/)?.[1] ||
    component?.rootCategorySlug ||
    'openstack-components';
  const root = catalog.find((row) => row.category.slug === rootSlug) || catalog[0];
  const sections = catalogSections(root);
  const [{ selected, capability }, setSelection] = useState(() =>
    catalogSelection(sections, initialHash),
  );
  const capabilities = capabilityGroups([
    ...new Map(
      flatten([root])
        .flatMap((item) => item.capability_tags || [])
        .map((tag) => [tag.name, tag]),
    ).values(),
  ]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const update = () => {
      setSelection(catalogSelection(sections, location.hash));
    };
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [rootSlug]);
  const section = sections.find((s) => s.category.slug === selected) || sections[0];
  const visibleGroups = componentGroups(section, query, capability);
  const matches = visibleGroups.reduce((sum, g) => sum + g.components.length, 0);
  return (
    <div className={`software-app${detailMatch ? '' : ' software-catalogue'}`}>
      {detailMatch ? (
        component ? (
          <ComponentDetails
            {...{ component, catalog, release, labels, descriptionHtml }}
            backHref={catalogLink('/software/project-navigator/' + rootSlug + '/')}
          />
        ) : (
          <section>
            <h1>Component not found</h1>
            <p>This release is not in the current catalog snapshot.</p>
            <a href="/software/">Browse available components</a>
          </section>
        )
      ) : (
        <>
          <h1 className="catalogue-title">{root.category.name}</h1>
          <nav className="software-category-tabs" aria-label="Component categories">
            {sections.map((s) => (
              <a
                key={s.category.slug}
                href={'#' + s.category.slug}
                aria-current={selected === s.category.slug ? 'true' : undefined}
                onClick={() => setSelection(catalogSelection(sections, s.category.slug))}
              >
                {s.category.label || s.category.name}
              </a>
            ))}
          </nav>
          <div className="software-catalogue-content">
            <details className="software-search-tools">
              <summary>Find a component</summary>
              <div className="software-filters">
                {capabilities.length > 0 && (
                  <label>
                    Filter by capability
                    <select
                      value={capability}
                      onChange={(event) => {
                        const hash = event.target.value || selected;
                        setSelection(catalogSelection(sections, hash));
                        window.location.hash = encodeURIComponent(hash);
                      }}
                    >
                      <option value="">All capabilities</option>
                      {capabilities.map((group) => (
                        <optgroup key={group.name} label={group.name}>
                          {group.items.map((tag) => (
                            <option key={tag.name} value={tag.name}>
                              {tag.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Find a component
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by project or service"
                  />
                </label>
              </div>
              <p role="status">
                {matches} {matches === 1 ? 'component' : 'components'}
              </p>
            </details>
            <OpenstackComponents
              id={section?.category.slug}
              title={section?.category.label || section?.category.name || ''}
              description={section?.category.description}
              groups={visibleGroups}
            />
          </div>
        </>
      )}
    </div>
  );
}
