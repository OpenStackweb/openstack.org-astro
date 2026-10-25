import type { APIContext } from 'astro';
import { env } from 'cloudflare:workers';
import { forwardSurvey } from '../../../lib/survey/gateway.mjs';
export const prerender = false;
export const ALL = ({ request }: APIContext) =>
  forwardSurvey(request, env, { development: import.meta.env.DEV });
