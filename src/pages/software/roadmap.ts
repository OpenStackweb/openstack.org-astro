import type { APIRoute } from 'astro';

// Match the public site and SvelteKit baseline. The Technical Committee owns
// active release goals; this route does not duplicate that content in the CMS.
export const GET: APIRoute = () => new Response(null, {
  status: 301,
  headers: { Location: 'https://governance.openstack.org/tc/goals/selected' },
});
export const HEAD = GET;
export const ALL: APIRoute = () => new Response(null, {
  status: 405,
  headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
});
