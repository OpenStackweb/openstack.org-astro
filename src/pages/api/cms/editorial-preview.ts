import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isUserAuthorized } from '@tinacms/auth';
import { handleEditorialPreview } from '../../../lib/server/editorial-preview-request.mjs';

export const ALL: APIRoute = ({ request }) =>
  handleEditorialPreview(request, env, isUserAuthorized);
