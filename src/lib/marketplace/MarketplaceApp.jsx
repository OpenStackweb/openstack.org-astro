import React, { useState } from 'react';
import { useProviderOrder } from './useProviderOrder';
import ProviderMap from './ProviderMap.jsx';
import ServiceBox from './ServiceBox';
export default function MarketplaceApp({ category, apiKey = '' }) {
  const orderedRecords = useProviderOrder(category.records, category.slug !== 'drivers');
  const [sort, setSort] = useState({ column: 'project', direction: 1 });
  const records =
    category.slug === 'drivers'
      ? [...orderedRecords].sort(
          (a, b) =>
            String(a[sort.column] || a.name).localeCompare(String(b[sort.column] || b.name)) *
            sort.direction,
        )
      : orderedRecords;
  return (
    <div className="marketplace-browser">
      <p role="status" aria-live="polite">
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
        <p>No listings are currently available.</p>
      )}
    </div>
  );
}
