import type { APIRoute } from 'astro';
import keys from '../../../lib/content/conference-keys.json';

// Historical feeds were explicitly retired; the event archives remain available.
export const GET: APIRoute = ({ params }) => {
  if (!params.event || !keys.includes(params.event)) return new Response('Not found', { status: 404 });
  return new Response('This historical Summit feed has been retired. The event archive remains available.', {
    status: 410,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' },
  });
};
