import type { APIRoute } from 'astro';
import { releasePath } from '../../../lib/server/release-announcements.mjs';

const records = Object.values(
  import.meta.glob('../../../lib/content/releases/*.json', { eager: true, import: 'default' }),
) as { slug: string; title: string }[];
export const GET: APIRoute = () =>
  Response.json(
    records.map(({ slug, title }) => ({ slug, title, path: releasePath(slug) })),
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
