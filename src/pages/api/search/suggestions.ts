import type { APIRoute } from 'astro';
import { searchParameters, suggestSite } from '../../../lib/server/site-search.mjs';

export const GET: APIRoute = async ({ url }) => {
  const { query } = searchParameters(url.searchParams);
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (query.length < 2) return new Response('[]', { headers });
  try {
    return new Response(JSON.stringify(await suggestSite(query)), { headers });
  } catch {
    return new Response('[]', { status: 503, headers });
  }
};
