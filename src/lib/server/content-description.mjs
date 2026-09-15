import { DomUtils, parseDocument } from 'htmlparser2';
import { renderEditorialBody } from './editorial.mjs';

// Keep search/social summaries tied to the editor-owned introduction, while
// removing Markdown, HTML and link destinations from metadata.
export function contentDescription(value, path) {
  const html = renderEditorialBody(value || '', path)
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote)>|<br\s*\/?\s*>/gi, '$& ');
  const text = DomUtils.innerText(parseDocument(html).children).replace(/\s+/g, ' ').trim();
  return text.length > 200 ? text.slice(0, 200).replace(/\s+\S*$/, '') + '…' : text;
}
