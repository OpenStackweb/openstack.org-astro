export function prepareLocations(input, renderBody) {
  if (!Array.isArray(input) || input.length > 200) throw new Error('Invalid archive locations.');
  const ids = new Set();
  return input.map((location) => {
    if (!/^\d+$/.test(location.id) || ids.has(location.id))
      throw new Error('Invalid or duplicate location ID.');
    ids.add(location.id);
    for (const key of ['name', 'address']) {
      if (typeof location[key] !== 'string' || location[key].length > 1000)
        throw new Error('Invalid location text.');
    }
    if (
      !location.name.trim() ||
      !Number.isFinite(location.lat) ||
      Math.abs(location.lat) > 90 ||
      !Number.isFinite(location.lng) ||
      Math.abs(location.lng) > 180
    )
      throw new Error('Invalid location coordinates.');
    return {
      id: location.id,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      html: renderBody(location.body || ''),
    };
  });
}
