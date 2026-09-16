// Ported from the SvelteKit migration baseline 032a176; service-owned data remains outside Tina.
// Build-time service client. Browser login credentials never enter this module.
// API shape reviewed in software-site at 5cfab8dab833689a3b929e5098b0083bbf18c9f3.
export const softwareSettings = [
  'GATSBY_SOFTWARE_API_BASE_URL', 'IDP_OAUTH2_TOKEN_URL',
  'SOFTWARE_API_OAUTH2_CLIENT_ID', 'SOFTWARE_API_OAUTH2_CLIENT_SECRET',
  'SOFTWARE_API_OAUTH2_SCOPES', 'GATSBY_LEGACY_SOFTWARE_BASE_URL',
];

function serviceURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
    throw new Error('Software service endpoints require HTTPS without embedded credentials or query parameters.');
  return url;
}

const pick = (record, names) => Object.fromEntries(names.filter(name => record?.[name] !== undefined).map(name => [name, record[name]]));
const publicURL = (value, base) => {
  try {
    if (typeof value !== 'string' || !value.trim()) return null;
    const rootRelative = base === '/';
    const url = new URL(value, rootRelative ? 'https://www.openstack.org/' : base);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return rootRelative && !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)
      ? url.pathname + url.search + url.hash : url.href;
  }
  catch { return null; }
};

export function buildSoftwareCatalog(categories, records, release, mascots, legacyBase, audit = {}) {
  audit.uncategorizedComponentIds = [];
  audit.componentsOutsideEnabledCategories = [];
  if (!release?.id || typeof release.name !== 'string' || !/^[\w.-]+$/.test(release.name))
    throw new Error('The Software API did not return a valid current release.');
  const nodes = new Map();
  for (const category of categories) {
    if (!Number.isInteger(category.id) || nodes.has(category.id) || !/^[a-z0-9-]+$/.test(category.slug))
      throw new Error('Invalid or duplicate software category.');
    nodes.set(category.id, { category: pick(category, ['id', 'name', 'label', 'description', 'slug', 'order', 'enabled', 'hide_subnav', 'parent_category_id']), subcategories: [], components: [] });
  }
  const roots = [];
  for (const node of nodes.values()) {
    let current = node;
    const seen = new Set();
    while (current) {
      if (seen.has(current.category.id)) throw new Error('Software categories contain a parent cycle.');
      seen.add(current.category.id);
      current = nodes.get(current.category.parent_category_id);
    }
    const parent = nodes.get(node.category.parent_category_id);
    if (node.category.parent_category_id && !parent) throw new Error('Software category parent is missing.');
    (parent ? parent.subcategories : roots).push(node);
  }
  const mascotMap = new Map(mascots.map(record => [record.id, record]));
  const mascotFor = record => {
    if (!record) return null;
    const value = typeof record.file === 'string' ? record.file : record.file?.public_url || record.file?.url;
    return { ...pick(record, ['id', 'name', 'code_name']), file: value ? { public_url: publicURL(value, legacyBase) } : null };
  };
  const link = record => record?.url && publicURL(record.url, legacyBase)
    ? { label: record.label || '', url: publicURL(record.url, legacyBase) } : null;
  const related = records => (records || []).map(record => ({
    ...pick(record, ['id', 'slug', 'code_name', 'mascot_id']), mascot: mascotFor(record.mascot || mascotMap.get(record.mascot_id)),
  }));
  const seenComponents = new Set();
  for (const pivot of records) {
    const record = pivot.component;
    const categoryId = record?.category_id ?? record?.category?.id;
    const category = nodes.get(categoryId);
    if (!record || !Number.isInteger(record.id)) throw new Error('Software release row is missing an expanded component ID.');
    // Gatsby's public catalog excludes unassigned components.
    // Missing fields or references to nonexistent categories remain contract errors.
    if (record.category_id === null && !record.category) {
      audit.uncategorizedComponentIds.push(record.id);
      continue;
    }
    if (!Number.isInteger(categoryId)) throw new Error(`Software component ${record.id} has an invalid category identifier (${typeof categoryId}).`);
    if (!category) {
      audit.componentsOutsideEnabledCategories.push({ componentId: record.id, categoryId });
      continue;
    }
    if (typeof record.code_name !== 'string' || !/^[\w.-]+$/.test(record.code_name)) throw new Error(`Software component ${record.id} has an invalid URL code name.`);
    if (seenComponents.has(record.id)) throw new Error(`Software component ${record.id} appears more than once in this release.`);
    seenComponents.add(record.id);
    let root = category;
    while (nodes.has(root.category.parent_category_id)) root = nodes.get(root.category.parent_category_id);
    category.components.push({
      ...pick(record, ['id', 'name', 'code_name', 'project_team', 'description', 'order', 'slug', 'since', 'category_id', 'mascot_id', 'youtube_id', 'video_description', 'video_title']),
      category_id: categoryId,
      has_installation_guide: Boolean(pivot.has_installation_guide),
      mascot: mascotFor(record.mascot || mascotMap.get(record.mascot_id)),
      docs_link: link(record.docs_link), download_link: link(record.download_link),
      links: (record.links || []).map(link).filter(Boolean),
      dependencies: related(record.dependencies), related_components: related(record.related_components),
      support_teams: related(record.support_teams),
      capability_tags: (record.capability_tags || []).map(tag => ({ ...pick(tag, ['name', 'description']), category: pick(tag.category, ['name']) })),
      href: `/releases/${release.name.toLowerCase()}/components/${record.code_name.toLowerCase()}`,
      rootCategorySlug: root.category.slug,
    });
  }
  const sortAndMeasure = node => {
    node.subcategories.sort((a, b) => (a.category.order || 0) - (b.category.order || 0));
    node.components.sort((a, b) => (a.order || 0) - (b.order || 0));
    node.depth = 1 + Math.max(0, ...node.subcategories.map(sortAndMeasure));
    return node.depth;
  };
  roots.forEach(sortAndMeasure);
  roots.sort((a, b) => (a.category.order || 0) - (b.category.order || 0));
  if (!roots.length || !seenComponents.size) throw new Error('Refusing to replace the software catalog with empty data.');
  return roots;
}

export function projectSampleConfigurations(types, catalog, legacyBase) {
  if (!Array.isArray(types)) throw new Error('Sample configuration types were not expanded.');
  const components = new Map();
  function visit(nodes) {
    for (const node of nodes) {
      for (const component of node.components) components.set(component.id, component);
      visit(node.subcategories);
    }
  }
  visit(catalog);
  const ordered = rows => [...rows].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
  const seen = new Set();
  const componentList = rows => {
    if (!Array.isArray(rows) || rows.some(row => !Number.isInteger(row?.id)))
      throw new Error('Sample configuration components were not expanded.');
    return rows.map(row => ({ ...pick(row, ['id','name','code_name','slug','age','adoption','maturity_points']),
      href: components.has(row.id) ? '/software' + components.get(row.id).href : null }));
  };
  return ordered(types).map(type => {
    if (!Number.isInteger(type?.id) || typeof type.type !== 'string' || !Array.isArray(type.sample_configs))
      throw new Error('Invalid sample configuration type.');
    const slug = type.type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug || seen.has(slug)) throw new Error('Sample configuration type URLs are invalid or duplicated.');
    seen.add(slug);
    return { ...pick(type, ['id','type','order','is_default']), slug,
      configurations: ordered(type.sample_configs).map(config => {
        if (!Number.isInteger(config?.id) || typeof config.title !== 'string' || !Array.isArray(config.related_notes))
          throw new Error('Invalid sample configuration.');
        return { ...pick(config, ['id','title','summary','description','order','is_default']),
          core_components: componentList(config.core_components),
          optional_components: componentList(config.optional_components),
          missing_core_components: componentList(config.missing_core_components),
          related_notes: ordered(config.related_notes).map(note => ({ ...pick(note, ['id','title','order']), link: publicURL(note.link, legacyBase) })).filter(note => note.link),
        };
      }),
    };
  });
}

export function publishedCatalogReleases(releases) {
  const selected = releases.filter(item => ['Current', 'SecuritySupported', 'EOL'].includes(item.status) && item.name?.toLowerCase() !== 'trunk');
  const ids = new Set(), slugs = new Set();
  for (const item of selected) {
    const slug = typeof item.name === 'string' ? item.name.toLowerCase() : '';
    if (!Number.isInteger(item.id) || item.id < 1 || !/^[a-z0-9-]+$/.test(slug) ||
        ids.has(item.id) || slugs.has(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(item.release_date))
      throw new Error('Published Software release identities are invalid or duplicated.');
    ids.add(item.id); slugs.add(slug);
  }
  return selected.sort((a, b) => b.release_date.localeCompare(a.release_date));
}

export async function fetchSoftwareCatalog(env, request = fetch, { includeSamples = false, includeReleaseIndex = false, includeHistory = false } = {}) {
  const missing = softwareSettings.filter(name => !env[name]);
  if (missing.length) throw new Error(`Missing Software API settings: ${missing.join(', ')}`);
  const base = serviceURL(env.GATSBY_SOFTWARE_API_BASE_URL);
  const tokenURL = serviceURL(env.IDP_OAUTH2_TOKEN_URL);
  const legacyBase = env.GATSBY_LEGACY_SOFTWARE_BASE_URL === '/' ? '/' : serviceURL(env.GATSBY_LEGACY_SOFTWARE_BASE_URL);
  async function json(url, options) {
    let response;
    try { response = await request(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(20000) }); }
    catch { throw new Error('Software service request failed; existing catalog was preserved.'); }
    if (!response.ok) throw new Error(`Software service returned HTTP ${response.status}; existing catalog was preserved.`);
    const text = await response.text();
    if (text.length > 10_000_000) throw new Error('Software service response exceeded the size limit.');
    try { return JSON.parse(text); } catch { throw new Error('Software service returned invalid JSON.'); }
  }
  const token = await json(tokenURL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${env.SOFTWARE_API_OAUTH2_CLIENT_ID}:${env.SOFTWARE_API_OAUTH2_CLIENT_SECRET}`).toString('base64')}` },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: env.SOFTWARE_API_OAUTH2_SCOPES }),
  });
  if (typeof token.access_token !== 'string' || !token.access_token) throw new Error('Software service token is missing.');
  async function collection(path, params = {}, firstOnly = false) {
    const results = [];
    let last = 1;
    for (let page = 1; page <= last; page++) {
      const url = new URL(path, base);
      url.search = new URLSearchParams({ per_page: '100', ...params, page: String(page) }).toString();
      const data = await json(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token.access_token}` } });
      if (!Array.isArray(data.data) || !Number.isInteger(data.last_page) || data.last_page < 1 || data.last_page > 20)
        throw new Error('Software pagination is invalid or exceeds the import limit.');
      if (data.current_page !== undefined && data.current_page !== page) throw new Error('Software pagination repeated a page.');
      results.push(...data.data);
      if (firstOnly) break;
      last = data.last_page;
    }
    return results;
  }
  const [releases, categories, mascots] = await Promise.all([
    collection('/api/v1/releases', { 'filter[]': 'status==Current', order: '-release_date', per_page: '1' }, true),
    collection('/api/v1/categories', { enabled: 'true', fields: 'id,name,label,description,slug,order,enabled,hide_subnav,parent_category_id' }),
    collection('/api/v1/mascots', { expand: 'file' }),
  ]);
  const release = releases[0];
  if (!Number.isInteger(release?.id) || release.status !== 'Current') throw new Error('No current Software API release was returned.');
  const expand = ['component', 'component.mascot', 'component.mascot.file', 'component.docs_link', 'component.download_link', 'component.links', 'component.dependencies', 'component.related_components', 'component.support_teams', 'component.capability_tags', 'component.capability_tags.category'].join(',');
  const fields = [
    'has_installation_guide',
    ...['id','name','code_name','project_team','description','order','slug','since','category_id','mascot_id','youtube_id','video_description','video_title'].map(field => `component.${field}`),
    ...['id','name','code_name','file.public_url'].map(field => `component.mascot.${field}`),
    ...['docs_link','download_link','links'].flatMap(relation => ['label','url'].map(field => `component.${relation}.${field}`)),
    ...['dependencies','related_components','support_teams'].flatMap(relation => ['id','slug','code_name','mascot_id'].map(field => `component.${relation}.${field}`)),
    'component.capability_tags.name','component.capability_tags.description','component.capability_tags.category.name',
  ].join(',');
  async function snapshotFor(release, withSamples) {
  const records = await collection(`/api/v1/releases/${release.id}/components`, { fields, expand, relations: `${expand},component.category,component.dependencies.mascot,component.related_components.mascot,component.support_teams.mascot` });
  const audit = {};
  const catalog = buildSoftwareCatalog(categories, records, release, mascots, legacyBase, audit);
  let samples;
  if (withSamples) {
    const prefix = 'sample_configuration_types.sample_configs';
    const expand = ['sample_configuration_types', prefix, ...['core_components','optional_components','missing_core_components','related_notes'].map(name => `${prefix}.${name}`)].join(',');
    const fields = ['id','name', ...['id','type','order','is_default'].map(name => `sample_configuration_types.${name}`),
      ...['id','title','summary','description','order','is_default','core_components','optional_components','missing_core_components','related_notes'].map(name => `${prefix}.${name}`)].join(',');
    const url = new URL(`/api/v1/releases/${release.id}`, base);
    url.search = new URLSearchParams({ expand, relations: expand, fields }).toString();
    const data = await json(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token.access_token}` } });
    samples = projectSampleConfigurations(data.sample_configuration_types, catalog, legacyBase);
  }
  return { catalog, audit, samples, release: pick(release, ['id', 'name', 'status', 'release_date', 'release_number']) };
  }
  const current = await snapshotFor(release, includeSamples);
  const releaseIndex = includeReleaseIndex || includeHistory
    ? (await collection('/api/v1/releases', { fields: 'id,name,release_number,release_date,status', order: '-release_date' }))
      .map(item => pick(item, ['id','name','release_number','release_date','status']))
    : undefined;
  let history;
  if (includeHistory) {
    history = [];
    const published = publishedCatalogReleases(releaseIndex).filter(item => item.id !== release.id);
    // Bound pressure on the service; each snapshot keeps its release-specific membership.
    for (let offset = 0; offset < published.length; offset += 2) {
      history.push(...await Promise.all(published.slice(offset, offset + 2).map(item => snapshotFor(item, includeSamples))));
    }
  }
  return { ...current, history, releaseIndex, source: base.origin };
}
