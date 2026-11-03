import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { robotsText } from '../lib/indexing.mjs';
export const GET: APIRoute = ({ url }) => {
  return new Response(robotsText(url, env), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
};
