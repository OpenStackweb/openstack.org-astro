import { independentFetch } from '../network/upstream.mjs';
const endpoints = {
  stories: { path: 'user-stories', expand: 'image' },
  companies: { path: 'companies' },
  services: { path: 'marketplace/services', expand: 'company' },
};
export async function editorRecords(request, upstreamFetch = fetch) {
  const guardedFetch = (input, options) => independentFetch(input, options, upstreamFetch);
  const input = new URL(request.url),
    kind = input.searchParams.get('kind');
  const config = endpoints[kind];
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (!config) return Response.json({ error: 'Unknown record type.' }, { status: 400, headers });
  const term = (input.searchParams.get('q') || '').trim();
  if (term.length > 100)
    return Response.json({ error: 'Search is too long.' }, { status: 400, headers });
  const url = new URL('https://oifapi.openinfra.dev/api/public/v1/' + config.path);
  url.searchParams.set('page', '1');
  url.searchParams.set('per_page', '20');
  if (config.expand) url.searchParams.set('expand', config.expand);
  if (term) url.searchParams.set('filter[]', 'name@@' + term.replace(/[,;]/g, '\\$&'));
  try {
    const response = await guardedFetch(url, {
      credentials: 'omit',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json', 'User-Agent': 'OpenStack-Beta-CMS' },
    });
    if (!response.ok)
      return Response.json(
        { error: 'The content service could not load records.' },
        { status: 502, headers },
      );
    const body = await response.json();
    if (!Array.isArray(body.data)) throw Error('Invalid records');
    // Match Gatsby's record selector: selecting a public record keeps its API
    // snapshot intact in Git. This endpoint cannot update the source service.
    return Response.json(
      {
        data: body.data
          .filter((row) => row && Number.isInteger(row.id) && typeof row.name === 'string')
          .slice(0, 20),
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: 'The content service is unavailable. Please retry.' },
      { status: 502, headers },
    );
  }
}
