import React, { useMemo, useState, useEffect } from 'react';
import { useProviderOrder } from './useProviderOrder';
import ProviderMap from './ProviderMap.jsx';
import ServiceBox from './ServiceBox';
import { matches, matchesConsulting, locationLabel, readFilters, filterHash } from './filters.mjs';
export default function MarketplaceApp({ category, apiKey = '' }) {
  const consulting = category.slug === 'consulting';
  const serviceLabel = consulting ? 'Service offered' : 'OpenStack service';
  const locationFieldLabel = consulting ? 'Office location' : 'Region or country';
  const orderedRecords = useProviderOrder(category.records, category.slug !== 'drivers');
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [component, setComponent] = useState('');
  const [vendor, setVendor] = useState('');
  const [release, setRelease] = useState('');
  const [serviceRegion, setServiceRegion] = useState('');
  const [filtersReady, setFiltersReady] = useState(false);
  useEffect(() => {
    const restoreFilters = () => {
      const filters = readFilters(window.location.hash, category.slug);
      setSearch(filters.search);
      setRegion(filters.region);
      setComponent(filters.component);
      setVendor(filters.vendor);
      setRelease(filters.release);
      setServiceRegion(filters.serviceRegion);
      setFiltersReady(true);
    };
    restoreFilters();
    window.addEventListener('hashchange', restoreFilters);
    return () => window.removeEventListener('hashchange', restoreFilters);
  }, [category.slug]);
  useEffect(() => {
    if (!filtersReady) return;
    const hash = filterHash(
      { search, region, component, vendor, release, serviceRegion },
      category.slug,
    );
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search + hash,
    );
  }, [filtersReady, search, region, component, vendor, release, serviceRegion, category.slug]);
  const [sort, setSort] = useState({ column: 'project', direction: 1 });
  const regions = useMemo(
    () =>
      [
        ...new Set(
          category.records
            .flatMap((r) => [
              ...r.regions,
              ...r.locations.flatMap((place) => [place.country, locationLabel(place)]),
            ])
            .filter(Boolean),
        ),
      ].sort(),
    [category],
  );
  const components = useMemo(
    () =>
      [
        ...new Set(
          category.records.flatMap((record) =>
            consulting
              ? record.offerings.map((offering) => offering.service).filter(Boolean)
              : [...record.components, record.project].filter(Boolean),
          ),
        ),
      ].sort(),
    [category],
  );
  const serviceRegions = [
    ...new Set(
      category.records
        .flatMap((record) => record.offerings.map((offering) => offering.region))
        .filter(Boolean),
    ),
  ].sort();
  const vendors = [...new Set(category.records.map((r) => r.vendor).filter(Boolean))].sort();
  const releases = [
    ...new Set(
      category.records.flatMap((r) => (r.releases || []).map((x) => x.name)).filter(Boolean),
    ),
  ].sort();
  const records = useMemo(() => {
    const matching = orderedRecords.filter(
      (record) =>
        (consulting
          ? matchesConsulting(record, search, region, component, serviceRegion)
          : matches(record, search, region, component)) &&
        (!vendor || record.vendor === vendor) &&
        (!release || record.releases.some((entry) => entry.name === release)),
    );
    if (category.slug !== 'drivers') return matching;
    return matching.sort(
      (a, b) =>
        String(a[sort.column] || a.name).localeCompare(String(b[sort.column] || b.name)) *
        sort.direction,
    );
  }, [
    category.slug,
    consulting,
    orderedRecords,
    search,
    region,
    component,
    vendor,
    release,
    serviceRegion,
    sort,
  ]);
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
            {locationFieldLabel}
            <select
              aria-label={locationFieldLabel}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All locations</option>
              {region && !regions.includes(region) && <option>{region}</option>}
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        )}
        {components.length > 0 && (
          <label>
            {serviceLabel}
            <select
              aria-label={serviceLabel}
              value={component}
              onChange={(e) => setComponent(e.target.value)}
            >
              <option value="">All services</option>
              {component && !components.includes(component) && <option>{component}</option>}
              {components.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        )}
        {consulting && serviceRegions.length > 0 && (
          <label>
            Service region
            <select
              aria-label="Service region"
              value={serviceRegion}
              onChange={(event) => setServiceRegion(event.target.value)}
            >
              <option value="">All service regions</option>
              {serviceRegion && !serviceRegions.includes(serviceRegion) && (
                <option>{serviceRegion}</option>
              )}
              {serviceRegions.map((value) => (
                <option key={value}>{value}</option>
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
            setServiceRegion('');
          }}
        >
          Clear filters
        </button>
      </form>
      {consulting && component && serviceRegion && (
        <p>Showing providers offering this service or serving this region.</p>
      )}
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
        <p>No listings match these filters. Try another search or clear the filters.</p>
      )}
    </div>
  );
}
