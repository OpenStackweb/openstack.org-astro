import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { serveCmsMedia } from '../../lib/server/cms-media-response.mjs';

export const ALL: APIRoute = ({ request, params }) =>
  serveCmsMedia(request, env.MEDIA, params.file);
