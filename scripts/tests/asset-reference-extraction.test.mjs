import test from 'node:test';
import assert from 'node:assert/strict';
import { assetReferences, cssReferences } from '../asset-reference-extraction.mjs';
const base = 'http://127.0.0.1:4478/archive/';

test('responsive candidates preserve comma URLs and ignore embedded data', () => {
  const rows = assetReferences(`<picture><source srcset="/small,a.png 1x, /large.png 2x"><img src="fallback.jpg" srcset="data:image/png;base64,AAAA 1x, /other.png 2x"></picture>`, base);
  assert.deepEqual(rows.map(row => row.url), [
    'http://127.0.0.1:4478/small,a.png', 'http://127.0.0.1:4478/large.png',
    base + 'fallback.jpg', 'http://127.0.0.1:4478/other.png',
  ]);
});

test('inline CSS handles quoted parentheses, entities, escaped paths and comments', () => {
  const rows = assetReferences(String.raw`<div style="background:url(&quot;/a(b).png?x=1&amp;y=2&quot;)"></div><style>/* url(fake.png) */ .x {background: url(/space\20 name.png); mask:url(#local); content:"url(not-an-image.png)"} .y { background:url(data:image/png;base64,AAAA) }</style>`, base);
  assert.deepEqual(rows.map(row => row.url), [
    'http://127.0.0.1:4478/a(b).png?x=1&y=2', 'http://127.0.0.1:4478/space%20name.png',
  ]);
  assert.deepEqual(rows.map(row => row.location), ['style attribute', 'style element']);
});

test('download scope excludes page links and does not inspect script strings', () => {
  const rows = assetReferences(`<a href="paper.pdf#page=2">Paper</a><a href="artwork.ai?download=1">Artwork</a><a href="/contact/">Contact</a><script>const image='url(hidden.png)'</script>`, base);
  assert.deepEqual(rows, [{ url: base + 'paper.pdf#page=2', kind: 'download', location: 'a[href]' }, { url: base + 'artwork.ai?download=1', kind: 'download', location: 'a[href]' }]);
});

test('unclosed CSS URL is an explicit audit error', () => {
  assert.throws(() => assetReferences('<div style="background:url(broken.png"></div>', base), /Unparsed CSS URL/);
});

test('linked stylesheets are distinguished from preloads and ordinary links', () => {
  const rows = assetReferences('<link rel="alternate StyleSheet" href="/styles/site.css"><link rel="preload" href="/other.css"><a href="/page/">Page</a>', base);
  assert.deepEqual(rows, [{ url: 'http://127.0.0.1:4478/styles/site.css', kind: 'stylesheet', location: 'link[rel=stylesheet]' }]);
});

test('CSS resources resolve relative to the stylesheet, including fonts and query strings', () => {
  const rows = cssReferences('@font-face{src:url(../fonts/font.woff2?v=2)} .hero{background:url(./hero.jpg)} .icon{mask:url(#icon)}', 'http://127.0.0.1:4478/styles/site.css');
  assert.deepEqual(rows.map(row => row.url), ['http://127.0.0.1:4478/fonts/font.woff2?v=2', 'http://127.0.0.1:4478/styles/hero.jpg']);
});
