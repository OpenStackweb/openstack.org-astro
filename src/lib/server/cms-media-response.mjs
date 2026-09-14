import { proofMediaKey, uploadPrefix } from './cms-media.mjs';
import { serveR2Media } from './media-assets.mjs';

const types = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf' };
export function serveCmsMedia(request, bucket, filename) {
  if (!proofMediaKey(uploadPrefix + filename)) return new Response(null, { status: 404 });
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  return serveR2Media(request, bucket, uploadPrefix + filename, {
    type: types[filename.split('.').pop()], filename, disposition: 'inline', missingStatus: 404,
  });
}
