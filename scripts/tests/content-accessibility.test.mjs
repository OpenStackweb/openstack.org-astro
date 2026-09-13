import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectContent } from '../audit-content-accessibility.mjs';
test('Static content review distinguishes named image links, decorative images and unnamed downloads', () => {
  assert.deepEqual(inspectContent('<main><a href="/menu.pdf"><img src="/menu.png" alt="Monday menu PDF"></a><img src="/decoration.svg" alt=""></main>'), []);
  assert.deepEqual(inspectContent('<main><a href="/menu.pdf"><img src="/menu.png" alt=""></a><img src="/photo.jpg"></main>'), [
    {kind:'unnamed-link',href:'/menu.pdf',image:'/menu.png'}, {kind:'image-alt-missing',src:'/photo.jpg'},
  ]);
});
test('Static review honors explicit labels, hidden content and non-link anchors', () => {
  assert.deepEqual(inspectContent('<main><span id="label" hidden>Download</span><a href="/file" aria-labelledby="label"></a><a href="/other" aria-label="More"></a><a name="section"></a><div hidden><a href="/invisible"></a></div><a href="/svg"><svg><title>Logo</title></svg></a></main>'), []);
});

test('Editorial sanitizing preserves a link name while removing executable attributes', async () => {
  const { renderEditorialBody } = await import('../../src/lib/server/editorial.mjs');
  const html = renderEditorialBody('<a href="https://www.hp.com/" aria-label="HP website" onclick="alert(1)"><img src="/hp.jpg" alt=""></a>', '/summit/portland-2013/sponsors/');
  assert.match(html, /aria-label="HP website"/);
  assert.doesNotMatch(html, /onclick/);
  assert.deepEqual(inspectContent(`<main>${html}</main>`), []);
});
