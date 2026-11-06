import navigation from '../lib/content/navbar.json';
import { publicNavigation } from '../lib/public-navigation.mjs';
export const prerender = true;
export const GET = () =>
  new Response(JSON.stringify(publicNavigation(navigation)), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
