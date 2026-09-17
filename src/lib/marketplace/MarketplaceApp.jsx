import React, { useMemo, useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import ServiceBox from './ServiceBox';
export function matches(record, search, region, component) {
  const q = search.trim().toLocaleLowerCase();
  return (
    (!q ||
      [record.name, record.overview, record.company.name, record.vendor, record.project].some(
        (value) => (value || '').toLocaleLowerCase().includes(q),
      )) &&
    (!region ||
      record.regions.includes(region) ||
      record.locations.some((p) => p.country === region)) &&
    (!component || record.components.includes(component) || record.project === component)
  );
}
function MapAvailability({ children }) {
  const status = useApiLoadingStatus();
  if ([APILoadingStatus.AUTH_FAILURE, APILoadingStatus.FAILED].includes(status))
    return (
      <p role="status">
        The map is unavailable for this preview. All providers remain available below.
      </p>
    );
  return children;
}
function CloudMap({ records, apiKey }) {
  const [selected, setSelected] = useState(null);
  const [failed, setFailed] = useState(false);
  const points = useMemo(
    () =>
      records
        .flatMap((record) =>
          record.locations.map((p, i) => ({ ...p, id: `${record.id}-${i}`, record })),
        )
        .filter(
          (p) =>
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lng) &&
            Math.abs(p.lat) <= 90 &&
            Math.abs(p.lng) <= 180,
        ),
    [records],
  );
  useEffect(() => setSelected(null), [records]);
  if (!points.length) return null;
  if (!apiKey)
    return (
      <p role="status">
        Map configuration is pending. All providers remain available in the list below.
      </p>
    );
  if (failed) return <p role="status">The map is unavailable. Browse the provider list below.</p>;
  return (
    <APIProvider apiKey={apiKey} onError={() => setFailed(true)}>
      <MapAvailability>
        <section aria-label="Cloud data center locations" className="marketplace-map">
          <Map
            defaultCenter={{ lat: 20, lng: 0 }}
            defaultZoom={2}
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            {points.map((p) => (
              <Marker
                key={p.id}
                position={{ lat: p.lat, lng: p.lng }}
                title={`${p.record.name} — ${p.city || p.country}`}
                onClick={() => setSelected(p)}
              />
            ))}
            {selected && (
              <InfoWindow
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <strong>{selected.record.name}</strong>
                <p>{[selected.city, selected.country].filter(Boolean).join(', ')}</p>
                <a href={selected.record.href}>View provider details</a>
              </InfoWindow>
            )}
          </Map>
        </section>
      </MapAvailability>
    </APIProvider>
  );
}
export default function MarketplaceApp({ category, apiKey = '' }) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [component, setComponent] = useState('');
  const [vendor, setVendor] = useState('');
  const [release, setRelease] = useState('');
  const [sort, setSort] = useState({ column: 'project', direction: 1 });
  const regions = useMemo(
    () =>
      [
        ...new Set(
          category.records
            .flatMap((r) => [...r.regions, ...r.locations.map((p) => p.country)])
            .filter(Boolean),
        ),
      ].sort(),
    [category],
  );
  const components = useMemo(
    () =>
      [
        ...new Set(category.records.flatMap((r) => [...r.components, r.project].filter(Boolean))),
      ].sort(),
    [category],
  );
  const vendors = [...new Set(category.records.map((r) => r.vendor).filter(Boolean))].sort();
  const releases = [
    ...new Set(
      category.records.flatMap((r) => (r.releases || []).map((x) => x.name)).filter(Boolean),
    ),
  ].sort();
  const records = useMemo(
    () =>
      category.records
        .filter(
          (r) =>
            matches(r, search, region, component) &&
            (!vendor || r.vendor === vendor) &&
            (!release || (r.releases || []).some((x) => x.name === release)),
        )
        .sort(
          (a, b) =>
            String(a[sort.column] || a.name).localeCompare(String(b[sort.column] || b.name)) *
            sort.direction,
        ),
    [category, search, region, component, vendor, release, sort],
  );
  return (
    <div className="marketplace-browser">
      <form
        className="marketplace-filters"
        onSubmit={(e) => e.preventDefault()}
        role="search"
        aria-label={`Search ${category.title}`}
      >
        <label>
          Search providers
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        {regions.length > 0 && (
          <label>
            Region or country
            <select
              aria-label="Region or country"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All locations</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        )}
        {components.length > 0 && (
          <label>
            OpenStack service
            <select
              aria-label="OpenStack service"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
            >
              <option value="">All services</option>
              {components.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
        {category.slug === 'drivers' && (
          <>
            <label>
              Vendor
              <select
                aria-label="Vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              >
                <option value="">All vendors</option>
                {vendors.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Release
              <select
                aria-label="Release"
                value={release}
                onChange={(e) => setRelease(e.target.value)}
              >
                <option value="">All releases</option>
                {releases.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            setVendor('');
            setRelease('');
            setSearch('');
            setRegion('');
            setComponent('');
          }}
        >
          Clear filters
        </button>
      </form>
      <p role="status" aria-live="polite">
        {records.length} {records.length === 1 ? 'listing' : 'listings'}
      </p>
      <CloudMap records={records} apiKey={apiKey} />
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
        <p>No listings match these filters. Try another search or clear the filters.</p>
      )}
    </div>
  );
}
