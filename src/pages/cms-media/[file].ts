import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { proofMediaKey, uploadPrefix } from '../../lib/server/cms-media.mjs';
export const GET: APIRoute = async ({ params }) => {
  const key = uploadPrefix + params.file;
  if (!proofMediaKey(key)) return new Response(null, { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response(null, { status: 404 });
  const types: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf' };
  return new Response(object.body, { headers: {
    'Content-Type': types[params.file!.split('.').pop()!],
    'Content-Disposition': 'inline', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "sandbox; default-src 'none'", 'Cache-Control': 'private, max-age=600',
    'X-Asset-Source': 'r2',
  } });
};
