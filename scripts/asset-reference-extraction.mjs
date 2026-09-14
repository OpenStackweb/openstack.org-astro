import { parseDocument, DomUtils } from 'htmlparser2';
import valueParser from 'postcss-value-parser';
import parseSrcset from 'parse-srcset';

const assetExtension = /\.(?:pdf|zip|pptx?|docx?|xlsx?|png|jpe?g|gif|svg|webp|mp4|mp3|gz|tgz)$/i;
const cssUnescape = value => value.replace(/\\([0-9a-f]{1,6}[\t\n\r\f ]?|[^\n\r\f])/gi, (_, escape) => {
  if (!/^[0-9a-f]/i.test(escape)) return escape;
  const code = parseInt(escape.trim(), 16);
  return code && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
});

export function cssReferences(value, baseURL, location = 'linked stylesheet') {
  const result = [];
  valueParser(value).walk(node => {
    if (node.type !== 'function' || node.value.toLowerCase() !== 'url') return;
    const child = node.nodes.filter(item => !['space', 'comment'].includes(item.type));
    if (node.unclosed || child.length !== 1 || !['word', 'string'].includes(child[0].type)) {
      throw new Error(`Unparsed CSS URL in ${location}`);
    }
    const raw = cssUnescape(child[0].value);
    if (raw && !raw.startsWith('#')) {
      const url = new URL(raw, baseURL);
      if (['http:', 'https:'].includes(url.protocol)) result.push({ url: url.href, kind: 'css-resource', location });
    }
    return false;
  });
  return result;
}

// Parse candidates without fetching third-party resources or running page scripts.
export function assetReferences(html, pageURL) {
  const result = [];
  const add = (raw, kind, location) => {
    if (!raw || raw.startsWith('#')) return;
    const url = new URL(raw, pageURL);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (kind === 'download' && !assetExtension.test(url.pathname)) return;
    result.push({ url: url.href, kind, location });
  };
  const css = (value, location) => result.push(...cssReferences(value, pageURL, location));
  for (const node of DomUtils.findAll(() => true, parseDocument(html).children)) {
    if (node.name === 'img') add(node.attribs.src, 'image', 'img[src]');
    if (node.name === 'a') add(node.attribs.href, 'download', 'a[href]');
    if (node.name === 'link' && node.attribs.rel?.toLowerCase().split(/\s+/).includes('stylesheet')) {
      add(node.attribs.href, 'stylesheet', 'link[rel=stylesheet]');
    }
    if (['img', 'source'].includes(node.name) && node.attribs.srcset) {
      for (const candidate of parseSrcset(node.attribs.srcset)) add(candidate.url, 'image', `${node.name}[srcset]`);
    }
    if (node.attribs?.style) css(node.attribs.style, 'style attribute');
    if (node.name === 'style') css(DomUtils.textContent(node), 'style element');
  }
  return result;
}
