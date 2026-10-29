import React, { useState, useCallback } from 'react';
import { useProviderOrder } from './useProviderOrder';
import ProviderMap from './ProviderMap.jsx';
import { useHashFilters } from './useHashFilters';
import { readFilters, filterHash, matches, matchesConsulting, locationLabel } from './filters.mjs';
import ServiceBox from './ServiceBox';
export default function MarketplaceApp({ category, apiKey = '' }) {
  const orderedRecords = useProviderOrder(category.records, category.slug !== 'drivers');
  const read = useCallback((hash) => readFilters(hash, category.slug), [category.slug]);
  const write = (filters) => filterHash(filters, category.slug);
  const [filters, setFilters] = useHashFilters(read, write);
  const matching = orderedRecords.filter(
    (r) =>
      (category.slug === 'consulting'
        ? matchesConsulting(
            r,
            filters.search,
            filters.region,
            filters.component,
            filters.serviceRegion,
          )
        : matches(r, filters.search, filters.region, filters.component)) &&
      (!filters.vendor || r.vendor === filters.vendor) &&
      (!filters.release || r.releases.some((release) => release.name === filters.release)),
  );
  const unique = (values) => [...new Set(values.filter(Boolean))].sort();
  const options = {
    region: unique(
      category.records.flatMap((r) => [...r.regions, ...r.locations.map(locationLabel)]),
    ),
    component: unique(
      category.records.flatMap((r) =>
        category.slug === 'drivers'
          ? [r.project]
          : category.slug === 'consulting'
            ? r.offerings.map((o) => o.service)
            : r.components,
      ),
    ),
    vendor: unique(category.records.map((r) => r.vendor)),
    release: unique(category.records.flatMap((r) => r.releases.map((release) => release.name))),
    serviceRegion: unique(category.records.flatMap((r) => r.offerings.map((o) => o.region))),
  };
  const [sort, setSort] = useState({ column: 'project', direction: 1 });
  const records =
    category.slug === 'drivers'
      ? [...matching].sort(
          (a, b) =>
            String(a[sort.column] || a.name).localeCompare(String(b[sort.column] || b.name)) *
            sort.direction,
        )
      : matching;
  return (
    <div className="marketplace-browser">
      <div className="marketplace-filters" role="search" aria-label="Filter Marketplace listings">
        <label>
          Search
          <input
            type="search"
            value={filters.search}
            placeholder="Name or keyword"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </label>
        {Object.entries({
          component: category.slug === 'drivers' ? 'Project' : 'Service',
          region: 'Location',
          vendor: 'Vendor',
          release: 'Release',
          serviceRegion: 'Service region',
        })
          .filter(
            ([key]) =>
              options[key].length && (key !== 'serviceRegion' || category.slug === 'consulting'),
          )
          .map(([key, label]) => (
            <label key={key}>
              {label}
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              >
                <option value="">All</option>
                {options[key].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          ))}
        <button type="button" onClick={() => setFilters(read(''))}>
          Clear filters
        </button>
      </div>
      <p className="marketplace-result-count" role="status" aria-live="polite">
        {records.length} {records.length === 1 ? 'listing' : 'listings'}
      </p>
      <ProviderMap records={records} apiKey={apiKey} />
      {category.slug === 'drivers' && records.length ? (
        <div className="marketplace-driver-table">
          <table>
            <thead>
              <tr>
                {['project', 'vendor', 'name'].map((column) => (
                  <th
                    key={column}
                    aria-sort={
                      sort.column === column
                        ? sort.direction === 1
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSort({ column, direction: sort.column === column ? -sort.direction : 1 })
                      }
                    >
                      {column === 'name' ? 'Driver' : column[0].toUpperCase() + column.slice(1)} ↕
                    </button>
                  </th>
                ))}
                <th>Ships with OpenStack</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.project}</td>
                  <td>{r.vendor}</td>
                  <td>
                    {r.href ? <a href={r.href}>{r.name}</a> : r.name}
                    <p>{r.overview}</p>
                  </td>
                  <td>
                    {(r.releases || []).map((release) => (
                      <div key={release.name}>
                        {release.url ? <a href={release.url}>{release.name}</a> : release.name}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : records.length ? (
        <div className="marketplace-results">
          {records.map((r) => (
            <ServiceBox key={r.id} service={r} />
          ))}
        </div>
      ) : (
        <p>No listings match these filters.</p>
      )}
    </div>
  );
}
