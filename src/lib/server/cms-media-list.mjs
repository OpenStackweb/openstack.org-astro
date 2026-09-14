import { mediaItem, uploadPrefix } from './cms-media.mjs';

/** Keep Tina's numeric offsets while traversing every R2 page needed for a match.
 * @param {{list: (options: {prefix: string, limit: number, include: Array<'customMetadata'>, cursor?: string}) => Promise<{objects: Array<{key: string, customMetadata?: Record<string, string>}>, truncated: boolean, cursor?: string}>}} bucket
 * @param {Record<string, {contentType: string}>} registry
 * @param {{search?: string, offset?: number, extensions?: string[]}} options
 */
export async function listCmsMedia(bucket, registry, { search = '', offset = 0, extensions = [] } = {}) {
  const items = [];
  let matched = 0;
  const accept = (item) => {
    if (!item.filename.toLowerCase().includes(search.toLowerCase()) ||
      (extensions.length && !extensions.includes(item.src.split('.').pop().toLowerCase()))) return false;
    if (matched++ >= offset) items.push(item);
    return items.length > 60;
  };
  const result = () => ({ items: items.slice(0, 60), nextOffset: items.length > 60 ? offset + 60 : undefined });
  let cursor;
  const seen = new Set();
  do {
    const page = await bucket.list({ prefix: uploadPrefix, limit: 1000, include: ['customMetadata'], ...(cursor ? { cursor } : {}) });
    for (const object of page.objects) {
      if (accept(mediaItem('/cms-media/' + object.key.slice(uploadPrefix.length), object.customMetadata?.filename || object.key))) return result();
    }
    if (!page.truncated) break;
    if (!page.cursor || seen.has(page.cursor)) throw new Error('Media pagination did not advance.');
    seen.add(page.cursor);
    cursor = page.cursor;
  } while (true);
  for (const [path, entry] of Object.entries(registry)) {
    if (/\.(png|jpe?g|webp|svg|pdf)$/i.test(path) && (entry.contentType.startsWith('image/') || entry.contentType === 'application/pdf')) {
      if (accept(mediaItem('/' + path, path))) break;
    }
  }
  return result();
}
