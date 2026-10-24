import type { APIRoute } from 'astro';
import home from '../lib/content/home.json';
import { latestReleasePath } from '../lib/server/latest-release.mjs';

const announcements = import.meta.glob('../lib/content/releases/*.json', {
  eager: true,
  import: 'default',
});
const destination = latestReleasePath(
  home.latestRelease.cta1_link,
  Object.values(announcements).map((page) => (page as { slug: string }).slug),
);

// Follow the homepage's editorial selection, independently of the Software
// service's Current release. A new selection must never be permanently cached.
export const GET: APIRoute = ({ url }) =>
  new Response(null, {
    status: 307,
    headers: { Location: destination + url.search, 'Cache-Control': 'no-store' },
  });
export const HEAD = GET;
export const ALL: APIRoute = () =>
  new Response(null, {
    status: 405,
    headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
  });
