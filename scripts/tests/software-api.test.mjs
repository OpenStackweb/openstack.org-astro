import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSoftwareCatalog, fetchSoftwareCatalog, projectSampleConfigurations, publishedCatalogReleases } from '../software-api.mjs';

const category = { id: 1, slug: 'openstack-components', name: 'Components', parent_category_id: null };
const release = { id: 7, name: 'TestRelease', status: 'Current' };
const component = { id: 4, code_name: 'Example', name: 'Fixture only', category_id: 1,
  private_field: 'do-not-publish', mascot: { id: 3, file: 'assets/example.png' },
  links: [{ label: 'Docs', url: 'https://docs.example.test/' }, { label: 'Unsafe', url: 'javascript:alert(1)' }] };
const env = { GATSBY_SOFTWARE_API_BASE_URL: 'https://software.example.test',
  IDP_OAUTH2_TOKEN_URL: 'https://identity.example.test/token', SOFTWARE_API_OAUTH2_CLIENT_ID: 'fixture-client',
  SOFTWARE_API_OAUTH2_CLIENT_SECRET: 'fixture-secret', SOFTWARE_API_OAUTH2_SCOPES: 'read',
  GATSBY_LEGACY_SOFTWARE_BASE_URL: 'https://legacy.example.test/' };

test('historical imports omit unpublished and deprecated releases and reject colliding URLs', () => {
  const older = { id: 2, name: 'Older', status: 'EOL', release_date: '2020-01-01' };
  const current = { ...release, release_date: '2024-01-01' };
  const future = { id: 3, name: 'Future', status: 'Future', release_date: '2030-01-01' };
  assert.deepEqual(publishedCatalogReleases([older, future, current, { ...future, status: 'Deprecated' }]).map(r => r.id), [7, 2]);
  assert.throws(() => publishedCatalogReleases([older, {...older, id: 4, name: 'OLDER'}]), /duplicated/);
  assert.throws(() => publishedCatalogReleases([{...older, name: '../unsafe'}]), /invalid/);
});

test('historical snapshots fetch each release membership and never reuse the current component set', async () => {
  const older = { id: 2, name: 'Older', status: 'EOL', release_date: '2020-01-01' };
  const current = { ...release, release_date: '2024-01-01' };
  const visited = [];
  const result = await fetchSoftwareCatalog(env, async url => {
    if (url.hostname === 'identity.example.test') return Response.json({access_token: 'fixture-token'});
    visited.push(url.pathname);
    let data = [];
    if (url.pathname === '/api/v1/releases') data = url.searchParams.has('filter[]') ? [current] : [current, older];
    if (url.pathname === '/api/v1/categories') data = [category];
    if (url.pathname === '/api/v1/releases/7/components') data = [{component}];
    if (url.pathname === '/api/v1/releases/2/components') data = [{component: {...component, id: 8, code_name: 'Retired'}}];
    return Response.json({data, current_page: 1, last_page: 1});
  }, {includeHistory: true});
  assert.equal(result.catalog[0].components[0].code_name, 'Example');
  assert.equal(result.history[0].catalog[0].components[0].code_name, 'Retired');
  assert.equal(result.history[0].catalog[0].components[0].href, '/releases/older/components/retired');
  assert.equal(visited.filter(path => path === '/api/v1/releases/7/components').length, 1);
});

test('software projection keeps public fields, normalizes media and derives component routes', () => {
  const result = buildSoftwareCatalog([category], [{ component }], release, [], env.GATSBY_LEGACY_SOFTWARE_BASE_URL);
  const item = result[0].components[0];
  assert.equal(item.href, '/releases/testrelease/components/example');
  assert.equal(item.mascot.file.public_url, 'https://legacy.example.test/assets/example.png');
  assert.equal(item.links.length, 1);
  assert.equal(item.private_field, undefined);
  assert.equal(result[0].depth, 1);
});

test('invalid category graphs and empty catalog projections fail closed', () => {
  assert.throws(() => buildSoftwareCatalog([{ ...category, parent_category_id: 1 }], [{ component }], release, [], 'https://example.test'));
  assert.throws(() => buildSoftwareCatalog([category], [], release, [], 'https://example.test'));
  assert.throws(() => buildSoftwareCatalog([{ ...category, parent_category_id: 999 }], [{ component }], release, [], 'https://example.test'), /parent is missing/);
});

test('service authentication stays at the token endpoint and catalog requests use only the bearer token', async () => {
  const requests = [];
  const respond = async (url, options) => {
    requests.push({ url: String(url), options });
    if (url.hostname === 'identity.example.test') return Response.json({ access_token: 'fixture-token' });
    let data;
    if (url.pathname === '/api/v1/releases') data = [release];
    else if (url.pathname === '/api/v1/categories') data = [category];
    else if (url.pathname === '/api/v1/mascots') data = [];
    else {
      // The service only includes selected scalar fields in expanded relations.
      const requested = url.searchParams.get('fields')?.split(',') ?? [];
      data = [{ component: requested.includes('component.category_id') ? component : { id: component.id, name: component.name } }];
    }
    return Response.json({ data, current_page: 1, last_page: 1 });
  };
  const result = await fetchSoftwareCatalog(env, respond);
  assert.equal(result.release.name, 'TestRelease');
  assert.equal(requests.length, 5);
  assert.match(requests[0].options.headers.Authorization, /^Basic /);
  for (const request of requests.slice(1)) {
    assert.equal(request.options.headers.Authorization, 'Bearer fixture-token');
    assert.equal(request.options.redirect, 'error');
    assert.doesNotMatch(request.url, /fixture-secret|fixture-token/);
  }
});

test('service failures omit upstream response bodies and invalid configuration never sends credentials', async () => {
  await assert.rejects(fetchSoftwareCatalog(env, async () => new Response('sensitive upstream detail', { status: 401 })), error => {
    assert.match(error.message, /HTTP 401/);
    assert.doesNotMatch(error.message, /sensitive/);
    return true;
  });
  const never = async () => { throw new Error('must not fetch'); };
  await assert.rejects(fetchSoftwareCatalog({ ...env, IDP_OAUTH2_TOKEN_URL: 'http://identity.example.test/token' }, never), /HTTPS/);
  await assert.rejects(fetchSoftwareCatalog({}, never), /Missing Software API settings/);
});

test('bounded pagination rejects repeated pages instead of duplicating data', async () => {
  await assert.rejects(fetchSoftwareCatalog(env, async url => {
    if (url.hostname === 'identity.example.test') return Response.json({ access_token: 'fixture-token' });
    if (url.pathname === '/api/v1/releases') return Response.json({ data: [release], current_page: 1, last_page: 1 });
    if (url.pathname === '/api/v1/mascots') return Response.json({ data: [], current_page: 1, last_page: 1 });
    return Response.json({ data: [category], current_page: 1, last_page: 2 });
  }), /repeated a page/);
});


test('the Gatsby root-relative legacy media base remains local without weakening API endpoint validation', () => {
  const result = buildSoftwareCatalog([category], [{ component }], release, [], '/');
  assert.equal(result[0].components[0].mascot.file.public_url, '/assets/example.png');
  assert.equal(result[0].components[0].links[0].url, 'https://docs.example.test/');
});


test('uncategorized service records follow Gatsby publication rules and are explicitly audited', () => {
  const audit = {};
  const records = [{ component }, { component: { ...component, id: 75, category_id: null } }];
  const result = buildSoftwareCatalog([category], records, release, [], '/', audit);
  assert.equal(result[0].components.length, 1);
  assert.deepEqual(audit.uncategorizedComponentIds, [75]);
  assert.throws(() => buildSoftwareCatalog([category], [{ component: { ...component, category_id: undefined } }], release, [], '/'), /invalid category identifier/);
});


test('components outside the enabled category collection follow Gatsby visibility and are audited', () => {
  const audit = {};
  const result = buildSoftwareCatalog([category], [{ component }, { component: { ...component, id: 40, category_id: 999 } }], release, [], '/', audit);
  assert.equal(result[0].components.length, 1);
  assert.deepEqual(audit.componentsOutsideEnabledCategories, [{ componentId: 40, categoryId: 999 }]);
});


test('sample configuration projection preserves selection, component statistics and notes without curator contact data', () => {
  const catalog = buildSoftwareCatalog([category], [{ component }], release, [], '/');
  const config = { id: 2, title: 'Starter', summary: '<p>Starter summary</p>', description: '', is_default: true,
    curator_email: 'private@example.test', curator_id: 123,
    core_components: [{ ...component, adoption: 80, maturity_points: 5, age: 10 }],
    optional_components: [], missing_core_components: [], related_notes: [{ id: 3, title: 'Reference', link: '/software/start/', order: 1 }] };
  const result = projectSampleConfigurations([{ id: 1, type: 'Compute Starter Kit', order: 1, is_default: true, sample_configs: [config] }], catalog, '/');
  assert.equal(result[0].slug, 'compute-starter-kit');
  assert.equal(result[0].configurations[0].core_components[0].href, '/software/releases/testrelease/components/example');
  assert.equal(result[0].configurations[0].core_components[0].adoption, 80);
  assert.equal(result[0].configurations[0].related_notes[0].link, '/software/start/');
  assert.doesNotMatch(JSON.stringify(result), /curator|private@example/);
  assert.throws(() => projectSampleConfigurations([1], catalog, '/'), /Invalid sample/);
  assert.throws(() => projectSampleConfigurations([{ id: 1, type: 'Starter', sample_configs: [{ ...config, core_components: [4] }] }], catalog, '/'), /not expanded/);
});
