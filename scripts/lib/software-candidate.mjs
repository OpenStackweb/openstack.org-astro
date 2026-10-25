// Only accepts the already allowlisted projection from fetchSoftwareCatalog.
// Output matches Astro's four existing service snapshot imports.
export function softwareCandidateFiles({ catalog, release, samples, history }) {
  if (
    !Array.isArray(catalog) ||
    !catalog.length ||
    !Array.isArray(samples) ||
    !Array.isArray(history)
  )
    throw Error('A complete catalogue, samples and release history are required.');
  const metadata = (value) => ({
    ...value,
    slug: value.name.toLowerCase(),
    source: 'software-api',
  });
  const populated = (types) => types.filter((type) => type.configurations.length);
  const current = metadata(release);
  return {
    'catalog.json': catalog,
    'catalog-release.json': current,
    'sample-configurations.json': { release: current, types: populated(samples) },
    'release-history.json': history.map((item) => ({
      release: metadata(item.release),
      catalog: item.catalog,
      samples: populated(item.samples),
    })),
  };
}
