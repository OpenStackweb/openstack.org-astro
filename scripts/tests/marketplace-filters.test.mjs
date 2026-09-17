import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readFilters,
  filterHash,
  locationLabel,
  matches,
} from '../../src/lib/marketplace/filters.mjs';
test('legacy cloud and driver filter hashes survive a round trip', () => {
  const clouds = readFilters(
    '#name=Test+Cloud&location=Montr%C3%A9al%2C+Canada&service=Compute',
    'public-clouds',
  );
  assert.equal(clouds.region, 'Montréal, Canada');
  assert.deepEqual(readFilters(filterHash(clouds, 'public-clouds'), 'public-clouds'), clouds);
  const drivers = readFilters('#project=Cinder&vendor=IBM&release=Zed', 'drivers');
  assert.equal(drivers.component, 'Cinder');
  assert.deepEqual(readFilters(filterHash(drivers, 'drivers'), 'drivers'), drivers);
  assert.equal(filterHash(readFilters('', 'drivers'), 'drivers'), '');
});
test('city-level legacy locations and country filters both match', () => {
  const location = { city: 'Montréal', state: '', country: 'CA' };
  assert.equal(locationLabel(location), 'Montréal, Canada');
  const record = {
    name: 'Cloud',
    company: { name: 'Provider' },
    regions: [],
    locations: [location],
    components: ['Compute'],
  };
  assert.equal(matches(record, '', 'Montréal, Canada', 'Compute'), true);
  assert.equal(matches(record, '', 'CA', ''), true);
  assert.equal(matches(record, '', 'Toronto, Canada', ''), false);
});

test('consulting keeps independent region and location hashes and source service-or-region semantics', async () => {
  const { matchesConsulting } = await import('../../src/lib/marketplace/filters.mjs');
  const filters = readFilters(
    '#service=Training&region=Europe&location=Paris%2C+France&name=Example',
    'consulting',
  );
  assert.equal(filters.serviceRegion, 'Europe');
  assert.equal(filters.region, 'Paris, France');
  assert.deepEqual(readFilters(filterHash(filters, 'consulting'), 'consulting'), filters);
  const record = {
    name: 'Example',
    overview: '',
    company: { name: 'Consultant' },
    components: [],
    regions: [],
    locations: [{ city: 'Paris', country: 'FR' }],
    offerings: [{ service: 'Training', region: 'North America' }],
  };
  assert.equal(matchesConsulting(record, '', '', 'Training', 'Europe'), true);
  assert.equal(matchesConsulting(record, '', '', 'Deployment', 'North America'), true);
  assert.equal(matchesConsulting(record, '', '', 'Deployment', 'Europe'), false);
  assert.equal(matchesConsulting(record, 'Example', 'France', '', ''), true);
  assert.equal(matchesConsulting(record, '', 'Berlin, Germany', 'Training', ''), false);
  assert.equal(matchesConsulting(record, 'another company', '', '', ''), false);
});
