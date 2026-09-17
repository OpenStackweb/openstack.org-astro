const countries = new Intl.DisplayNames(['en'], { type: 'region' });
export function locationLabel(place) {
  let country = place.country || '';
  if (/^[A-Za-z]{2}$/.test(country)) country = countries.of(country.toUpperCase()) || country;
  return [place.city, place.state, country].filter(Boolean).join(', ');
}

// Preserve the existing microsite's public hash keys for clouds and drivers.
export function readFilters(hash, category) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    search: params.get('name')?.trim() || '',
    region: params.get('location')?.trim() || '',
    component: params.get(category === 'drivers' ? 'project' : 'service')?.trim() || '',
    vendor: params.get('vendor')?.trim() || '',
    release: params.get('release')?.trim() || '',
  };
}
export function filterHash(filters, category) {
  const values = {
    name: filters.search,
    location: filters.region,
    [category === 'drivers' ? 'project' : 'service']: filters.component,
    vendor: filters.vendor,
    release: filters.release,
  };
  const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
  return params.size ? `#${params}` : '';
}
export function matches(record, search, region, component) {
  const query = search.trim().toLocaleLowerCase();
  return (
    (!query ||
      [record.name, record.overview, record.company.name, record.vendor, record.project].some(
        (value) => (value || '').toLocaleLowerCase().includes(query),
      )) &&
    (!region ||
      record.regions.includes(region) ||
      record.locations.some(
        (place) => place.country === region || locationLabel(place) === region,
      )) &&
    (!component || record.components.includes(component) || record.project === component)
  );
}
