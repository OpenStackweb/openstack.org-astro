import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isUserAuthorized } from '@tinacms/auth';
import metadata from '../../../lib/software/catalogue-refresh.json';
import release from '../../../lib/software/catalog-release.json';
import { handleSoftwareRefresh } from '../../../lib/server/software-refresh.mjs';
export const ALL: APIRoute = ({ request }) =>
  handleSoftwareRefresh(request, env, { ...metadata, release: release.name }, isUserAuthorized);
