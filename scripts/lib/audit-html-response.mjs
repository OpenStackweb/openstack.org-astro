import { parseDocument, DomUtils } from 'htmlparser2';

// An HTTP response is not evidence of a rendered page until its status, media
// type and document structure agree. Keep these failures separate from missing
// editorial metadata, which the SEO report intentionally records for review.
export async function readAuditHtml(response) {
  if (response.status !== 200) return { failure: 'not-rendered-200' };
  const mediaType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (mediaType !== 'text/html') return { failure: 'not-html' };
  const document = parseDocument(await response.text());
  const elements = DomUtils.findAll(() => true, document.children);
  if (!['html', 'head', 'body'].every(name => elements.some(element => element.name === name))) {
    return { failure: 'incomplete-html-document' };
  }
  return { document, elements };
}
