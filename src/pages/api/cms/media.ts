import { listCmsMedia } from '../../../lib/server/cms-media-list.mjs';
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isUserAuthorized } from '@tinacms/auth';
import registry from '../../../lib/content/media.json';
import { fileType, maxUpload, mediaItem, uploadPrefix } from '../../../lib/server/cms-media.mjs';

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
export const ALL: APIRoute = async ({ request, url }) => {
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
  if (request.method === 'POST' && request.headers.get('origin') !== url.origin)
    return json({ error: 'Upload must originate from this editor.' }, 403);
  const local =
    (import.meta.env.DEV || (env as unknown as Record<string, string>).CMS_LOCAL_TEST === '1') &&
    ['127.0.0.1', 'localhost'].includes(url.hostname);
  if (!local) {
    const clientID = (env as unknown as Record<string, string>).PUBLIC_TINA_CLIENT_ID;
    const token = request.headers.get('authorization');
    if (!clientID || !token)
      return json({ error: 'Sign in to the configured Tina project to use media.' }, 401);
    try {
      const user = await isUserAuthorized({ clientID, token });
      // currentUser is scoped to this clientID. Tina's live response omits role;
      // require its verified, enabled membership rather than an absent field.
      if (user?.verified !== true || user.enabled !== true)
        return json({ error: 'Editor access required.' }, 403);
    } catch {
      return json({ error: 'Editor authentication is temporarily unavailable.' }, 503);
    }
  }
  const bucket = env.MEDIA;
  if (!bucket) return json({ error: 'Media storage is unavailable.' }, 503);
  try {
    if (request.method === 'GET') {
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const offset = Number(url.searchParams.get('offset') || 0);
      const extensions = (url.searchParams.get('ext') || '').split(',').filter(Boolean);
      if (!Number.isSafeInteger(offset) || offset < 0)
        return json({ error: 'Invalid offset' }, 400);
      return json(await listCmsMedia(bucket, registry, { search, offset, extensions }));
    }
    const length = Number(request.headers.get('content-length'));
    if (!length || length > maxUpload + 65536)
      return json({ error: 'Upload a file up to 10 MiB.' }, 413);
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string' || file.size > maxUpload || !file.size)
      return json({ error: 'Upload a nonempty file up to 10 MiB.' }, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = fileType(bytes);
    if (!type) return json({ error: 'Supported uploads: PNG, JPEG, WebP and PDF.' }, 415);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, '0')).join(
      '',
    );
    const filename = file.name.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 180);
    const key = `${uploadPrefix}${hash}.${type[0]}`;
    if (!(await bucket.head(key)))
      await bucket.put(key, bytes, {
        httpMetadata: { contentType: type[1] },
        customMetadata: { filename },
      });
    return json(mediaItem(`/cms-media/${hash}.${type[0]}`, filename), 201);
  } catch {
    return json({ error: 'Media storage is temporarily unavailable. Please retry.' }, 503);
  }
};
