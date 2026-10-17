import { decodeHTML } from 'entities';
import sanitizeHtml from 'sanitize-html';
import { reviewHref } from '../legacy-routes.js';
export const maximumSearchPage = 1000;
export const searchEndpoint = 'https://search.openstack.org/api/public/v1/search/www-openstack/';
const plain = (value) =>
  decodeHTML(
    sanitizeHtml(String(Array.isArray(value) ? (value[0] ?? '') : (value ?? '')), {
      allowedTags: [],
      allowedAttributes: {},
    })
  )
    .replace(/\s+/g, ' ')
    .trim();
export function searchParameters(params) {
  const query = (params.get('q') ?? '').trim().slice(0, 200);
  const rawPage = params.get('page') ?? '1';
  const page = /^\d{1,4}$/.test(rawPage) ? Math.max(1, Math.min(maximumSearchPage, Number(rawPage))) : 1;
  return { query, page };
}
export function publicSearchResults(payload) {
  if (
    !Array.isArray(payload?.results) ||
    !Number.isSafeInteger(payload.qty) ||
    payload.qty < 0 ||
    payload.results.length > 10
  )
    throw new Error('Unexpected search response.');
  return {
    total: payload.qty,
    results: payload.results.flatMap((r) => {
      let url;
      try {
        url = new URL(r.url);
      } catch {
        return [];
      }
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
      const title = plain(r.meta_title) || plain(r.title) || url.hostname;
      return [
        {
          title,
          url: reviewHref(url.href),
          description: (plain(r.meta_description) || plain(r.content)).slice(0, 320),
        },
      ];
    }),
  };
}
async function fetchSearchJson(url, fetcher) {
  const response = await fetcher(url, {
    credentials: 'omit',
    redirect: 'manual',
    signal: AbortSignal.timeout(8000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
    throw new Error('Search unavailable.');
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2_000_000) throw new Error('Search response too large.');
      chunks.push(value);
    }
  } catch (e) {
    await reader.cancel();
    throw e;
  }
  const merged = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(merged));
}

export async function searchSite(query, page, fetcher = fetch) {
  const url = searchEndpoint + encodeURIComponent(query) + `?page=${page}&page_size=10`;
  return publicSearchResults(await fetchSearchJson(url, fetcher));
}

export function publicSuggestions(payload) {
  if (!Array.isArray(payload?.results) || payload.results.length > 100)
    throw new Error('Unexpected suggestions response.');
  const seen = new Set();
  return payload.results.flatMap(row => {
    if (!row || typeof row.payload !== 'string') return [];
    let url;
    try { url = new URL(row.payload); } catch { return []; }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return [];
    const title = plain(row.term);
    const href = reviewHref(url.href);
    if (!title || seen.has(href)) return [];
    seen.add(href);
    return [{ title: title.slice(0, 200), url: href }];
  }).slice(0, 6);
}

export async function suggestSite(query, fetcher = fetch) {
  const url = 'https://search.openstack.org/api/public/v1/suggestions/www-openstack/' + encodeURIComponent(query);
  return publicSuggestions(await fetchSearchJson(url, fetcher));
}
