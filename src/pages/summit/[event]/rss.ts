import type { APIRoute } from 'astro';
import keys from '../../../lib/content/conference-keys.json';
import events from '../../../lib/server/archive-event-content.mjs';
import { editorialPageFor } from '../../../lib/server/editorial-pages.js';
import { prepareConference } from '../../../lib/server/conferences.mjs';
import { conferenceFeed } from '../../../lib/server/conference-feed.mjs';

export const GET: APIRoute = ({ params }) => {
  if (!params.event || !keys.includes(params.event)) return new Response('Not found', { status: 404 });
  const page = prepareConference(params.event, events, editorialPageFor);
  return new Response(conferenceFeed(page), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
