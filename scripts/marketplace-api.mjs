import assert from 'node:assert/strict';
import sanitizeHtml from 'sanitize-html';
import { locationLabel } from '../src/lib/marketplace/filters.mjs';
export const categories = [
  { slug: 'public-clouds', endpoint: 'public-clouds', title: 'Public Clouds' },
  {
    slug: 'hosted-private-clouds',
    endpoint: 'hosted-private-clouds',
    title: 'Hosted Private Clouds',
  },
  {
    slug: 'remotely-managed-private-clouds',
    endpoint: 'remotely-managed-private-clouds',
    title: 'Remotely Managed Private Clouds',
  },
  { slug: 'distros', endpoint: 'distros', title: 'Distributions and Appliances' },
  { slug: 'consulting', endpoint: 'consultants', title: 'Consulting' },
  { slug: 'training', endpoint: 'trainings', title: 'Training' },
  { slug: 'drivers', endpoint: 'drivers', title: 'Drivers' },
];
export function publicUrl(value) {
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : '';
  } catch {
    return '';
  }
}
const text = (value) => (typeof value === 'string' ? value : '');
const list = (value) => (Array.isArray(value) ? value : []);
const names = (items, field = 'name') => [
  ...new Set(
    list(items)
      .map((item) => text(item?.[field]))
      .filter(Boolean),
  ),
];
export const richText = (value) =>
  sanitizeHtml(text(value), {
    allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
  });
const links = (items) =>
  list(items)
    .map((item) => ({ name: text(item.name), url: publicUrl(item.uri) }))
    .filter((item) => item.name && item.url);
const timestamp = (value) => (Number.isFinite(value) && value > 0 ? value : null);

export function projectRecord(row, category) {
  assert.ok(Number.isSafeInteger(row.id), 'Record ID must be an integer');
  const company = row.company || {};
  const name = text(row.name);
  assert.ok(name, 'Record name is required');
  const companySlug = text(company.url_segment);
  const slug = text(row.slug);
  if (category.slug !== 'drivers')
    assert.ok(companySlug && slug, 'Company and service slugs are required');
  const locations = list(row.data_centers || row.offices).map((place) => ({
    city: text(place.city),
    state: text(place.state),
    country: text(place.country),
    region: text(place.region?.name),
    endpoint: publicUrl(place.region?.endpoint),
    availabilityZones: names(place.availability_zones),
    lat: place.lat == null || place.lat === '' ? null : Number(place.lat),
    lng: place.lng == null || place.lng === '' ? null : Number(place.lng),
  }));
  return {
    id: row.id,
    name,
    overview: text(row.overview || row.description),
    descriptionHtml: richText(row.overview || row.description),
    resources: links(row.resources),
    caseStudies: links(row.case_studies),
    videos: list(row.videos)
      .filter((video) => /^[A-Za-z0-9_-]{11}$/.test(text(video.youtube_id)))
      .map((video) => ({
        name: text(video.name),
        youtubeId: video.youtube_id,
      })),
    reviews: list(row.reviews)
      .map((review) => ({
        id: review.id,
        title: text(review.title),
        comment: text(review.comment),
        rating:
          Number.isFinite(review.rating) && review.rating >= 0 && review.rating <= 5
            ? review.rating
            : null,
        created: timestamp(review.created),
        author:
          [text(review.author?.first_name), text(review.author?.last_name)]
            .filter(Boolean)
            .join(' ') || 'Anonymous',
      }))
      .sort((a, b) => (b.created || 0) - (a.created || 0)),
    specifications: [
      {
        title: 'Pricing options',
        items: names(
          list(row.capabilities).flatMap((item) => list(item.pricing_schemas)),
          'type',
        ),
      },
      { title: 'Supported hypervisors', items: names(row.hypervisors, 'type') },
      { title: 'Supported guest operating systems', items: names(row.guests, 'type') },
      { title: 'Expertise', items: names(row.expertise_areas) },
      {
        title: 'Services offered',
        items: names(
          list(row.services_offered).map((item) => item.service_offered_type),
          'type',
        ),
      },
      {
        title: 'Configuration management expertise',
        items: names(row.configuration_management_expertise, 'type'),
      },
      { title: 'Languages', items: names(row.spoken_languages) },
      { title: 'Clients', items: names(row.clients) },
    ].filter((section) => section.items.length),
    href:
      category.slug === 'drivers'
        ? publicUrl(row.url)
        : `/marketplace/${category.slug}/${encodeURIComponent(companySlug)}/${encodeURIComponent(slug)}/`,
    website: publicUrl(row.call_2_action_url),
    company: {
      name: text(company.name),
      overviewHtml: richText(company.overview),
      commitmentHtml: richText(company.commitment),
      coaPartner: company.is_coa_partner === true,
      logo: publicUrl(company.logo),
      color: /^#[0-9a-f]{3,8}$/i.test(company.color || '') ? company.color : '#005580',
    },
    tested: row.is_openstack_tested === true || row.tested === true,
    bareMetal: row.uses_ironic === true,
    federatedIdentity: row.is_compatible_with_federated_identity === true,
    project: text(row.project),
    vendor: text(row.vendor),
    locations,
    releases: list(row.releases).map((r) => ({ name: text(r.name), url: publicUrl(r.url) })),
    components: [
      ...new Set(
        list(row.capabilities)
          .map((c) =>
            text(
              c.release_supported_api_version?.component?.name ||
                c.release_supported_api_version?.component?.code_name,
            ),
          )
          .filter(Boolean),
      ),
    ],
    regions: [
      ...new Set(
        list(row.supported_regions)
          .map((r) => text(r.region?.name))
          .filter(Boolean),
      ),
    ],
    courses: list(row.courses).map((c) => ({
      id: c.id,
      name: text(c.name),
      description: text(c.description),
      descriptionHtml: richText(c.description),
      level: text(c.level?.level),
      type: text(c.type?.type),
      url: publicUrl(c.link),
      online: c.is_online === true,
      projects: names(c.projects),
      locations: [...new Set(list(c.schedules).map(locationLabel).filter(Boolean))],
      schedules: list(c.schedules).flatMap((schedule) =>
        list(schedule.times).map((time) => ({
          location: [text(schedule.city), text(schedule.country)].filter(Boolean).join(', '),
          start: timestamp(time.start_date),
          end: timestamp(time.end_date),
        })),
      ),
    })),
  };
}
export async function fetchCategory(base, category, fetcher = fetch) {
  const records = [],
    seen = new Set();
  let total, lastPage;
  for (let page = 1; page <= 100; page++) {
    const url = new URL(`/api/public/v1/marketplace/${category.endpoint}`, base);
    url.searchParams.set('per_page', '100');
    url.searchParams.set('page', String(page));
    url.searchParams.set(
      'expand',
      category.slug === 'drivers'
        ? 'releases'
        : 'company,data_centers,data_centers.region,data_centers.availability_zones,offices,supported_regions,supported_regions.region,capabilities,capabilities.release_supported_api_version,capabilities.release_supported_api_version.component,courses,courses.level,courses.type,courses.projects,courses.schedules,courses.schedules.times,hypervisors,guests,capabilities.pricing_schemas,clients,expertise_areas,services_offered,services_offered.service_offered_type,spoken_languages,configuration_management_expertise,resources,case_studies,videos,reviews,reviews.author',
    );
    const response = await fetcher(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'OpenStack-Astro-Marketplace/1.0' },
      signal: AbortSignal.timeout(30000),
      redirect: 'error',
    });
    assert.ok(response.ok, `Marketplace ${category.endpoint} returned HTTP ${response.status}`);
    const data = await response.json();
    assert.ok(
      Array.isArray(data.data) &&
        Number.isSafeInteger(data.total) &&
        data.total >= 0 &&
        Number.isSafeInteger(data.last_page) &&
        data.last_page >= 1 &&
        data.last_page <= 100 &&
        data.current_page === page,
      'Invalid Marketplace pagination',
    );
    if (page === 1) {
      total = data.total;
      lastPage = data.last_page;
    }
    assert.ok(
      data.total === total && data.last_page === lastPage,
      'Catalogue changed during pagination; retry',
    );
    for (const raw of data.data) {
      assert.ok(!seen.has(raw.id), 'Duplicate Marketplace record');
      seen.add(raw.id);
      records.push(projectRecord(raw, category));
    }
    if (page === lastPage) {
      assert.equal(records.length, total, 'Incomplete Marketplace catalogue');
      return { ...category, records };
    }
  }
  throw new Error('Marketplace pagination limit exceeded');
}
