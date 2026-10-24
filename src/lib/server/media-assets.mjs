// Uploaded media is private in R2. Cloudflare Access protects the site entrypoint;
// this handler only exposes files in the Git-reviewed publication registry.
const types = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  ai: 'application/postscript',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odp: 'application/vnd.oasis.opendocument.presentation',
  zip: 'application/zip',
  ics: 'text/calendar',
};

const mediaRoot = (path) =>
  path.startsWith('/assets/') || path.startsWith('/themes/openstack/images/');

export function mediaKey(path) {
  if (!mediaRoot(path)) return null;
  try {
    const key = decodeURIComponent(path.slice(1));
    if (
      /[\\\x00-\x1f\x7f%]/.test(key) ||
      key.split('/').some((p) => !p || p === '.' || p === '..' || p.startsWith('.'))
    )
      return null;
    return key;
  } catch {
    return null;
  }
}

export function mediaRange(value, size) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  // Ignore malformed or multipart ranges; returning the full file is valid.
  if (!match || (!match[1] && !match[2])) return null;
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if (
    (first !== null && !Number.isSafeInteger(first)) ||
    (last !== null && !Number.isSafeInteger(last))
  )
    return false;
  if (
    !size ||
    first >= size ||
    (first === null && last === 0) ||
    (first !== null && last !== null && last < first)
  )
    return false;
  const offset = first === null ? Math.max(0, size - last) : first;
  return {
    offset,
    length: (first === null || last === null ? size - 1 : Math.min(last, size - 1)) - offset + 1,
  };
}

const matches = (value, etag) =>
  value.split(',').some((v) => v.trim() === '*' || v.trim().replace(/^W\//, '') === etag);
const failed = (status, reason = 'unavailable') =>
  new Response(status === 503 ? `Media temporarily unavailable (${reason}).` : null, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Media-Failure': reason,
    },
  });

export async function serveMedia(request, bucket, registry = {}) {
  const path = new URL(request.url).pathname;
  if (!bucket || !mediaRoot(path)) return null;
  const key = mediaKey(path);
  if (!key) return failed(404);
  if (!['GET', 'HEAD'].includes(request.method)) {
    const response = failed(405);
    response.headers.set('Allow', 'GET, HEAD');
    return response;
  }
  const entry = Object.hasOwn(registry, key) ? registry[key] : null;
  if (!entry) return null;
  if (!/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0)
    return failed(503, 'registry');
  const objectKey = `legacy/${entry.sha256}`;
  const type = types[key.split('.').pop().toLowerCase()];
  // A published registry entry must have a supported, consistent content type.
  if (!type || type !== entry.contentType) return failed(503, 'type');
  return serveR2Media(request, bucket, objectKey, {
    type,
    bytes: entry.bytes,
    filename: key.split('/').pop(),
    disposition: entry.disposition,
  });
}

// Share HTTP delivery semantics with editor uploads; callers retain their own
// publication/path checks and choose the exact permitted object key and type.
export async function serveR2Media(
  request,
  bucket,
  objectKey,
  { type, bytes, filename, disposition, missingStatus = 503 },
) {
  try {
    const metadata = await bucket.head(objectKey);
    if (!metadata) return failed(missingStatus, 'missing');
    if (bytes !== undefined && metadata.size !== bytes) return failed(503, 'size');
    const modified = metadata.uploaded.toUTCString();
    const headers = new Headers({
      'Content-Type': type,
      'Content-Length': String(metadata.size),
      ETag: metadata.httpEtag,
      'Last-Modified': modified,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=600',
      'X-Content-Type-Options': 'nosniff',
      'X-Asset-Source': 'r2',
      'X-Robots-Tag': 'noindex, nofollow',
    });
    if (!type.startsWith('image/')) {
      const inline = type === 'application/pdf' && disposition === 'inline';
      headers.set(
        'Content-Disposition',
        `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );
      headers.set(
        'Content-Security-Policy',
        inline ? "default-src 'none'" : "sandbox; default-src 'none'",
      );
    }
    if (type === 'image/svg+xml') {
      headers.set(
        'Content-Security-Policy',
        "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      );
    }
    const noneMatch = request.headers.get('If-None-Match');
    const since = request.headers.get('If-Modified-Since');
    if (
      (noneMatch && matches(noneMatch, metadata.httpEtag)) ||
      (!noneMatch && since && Date.parse(modified) <= Date.parse(since))
    ) {
      headers.delete('Content-Length');
      return new Response(null, { status: 304, headers });
    }
    if (request.method === 'HEAD') return new Response(null, { headers });
    const ifRange = request.headers.get('If-Range');
    // If-Range uses exact validators, unlike If-Modified-Since (RFC 9110 §13.1.5).
    // Registered objects are content-addressed; their bytes do not change in place.
    const useRange = !ifRange || ifRange === metadata.httpEtag || ifRange === modified;
    const range = useRange ? mediaRange(request.headers.get('Range'), metadata.size) : null;
    if (range === false) {
      headers.set('Content-Range', `bytes */${metadata.size}`);
      headers.delete('Content-Length');
      return new Response(null, { status: 416, headers });
    }
    const object = await bucket.get(objectKey, {
      onlyIf: { etagMatches: metadata.etag },
      ...(range ? { range } : {}),
    });
    // Never return a body inconsistent with the metadata/conditional response.
    if (!object || !('body' in object)) return failed(503, 'changed');
    if (range) {
      headers.set(
        'Content-Range',
        `bytes ${range.offset}-${range.offset + range.length - 1}/${metadata.size}`,
      );
      headers.set('Content-Length', String(range.length));
    }
    return new Response(object.body, { status: range ? 206 : 200, headers });
  } catch {
    // Do not turn R2 outages into silent origin load or leak bucket diagnostics.
    return failed(503, 'storage');
  }
}

// Only website-owned legacy storage URLs with a published mapping move to R2.
// Service/API-owned image containers retain their own delivery and ownership.
export function localMediaHref(value, registry) {
  try {
    const url = new URL(value);
    const prefix = '/swift/v1/6e4619c416ff4bd19e1c087f27a43eea/www-assets-prod/';
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'object-storage-ca-ymq-1.vexxhost.net' ||
      url.username ||
      url.password ||
      url.port ||
      !url.pathname.startsWith(prefix)
    )
      return null;
    const path = '/assets/' + url.pathname.slice(prefix.length);
    const key = mediaKey(path);
    return key && Object.hasOwn(registry, key) ? path + url.search + url.hash : null;
  } catch {
    return null;
  }
}
