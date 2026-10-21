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

test('City-guide presentation survives sanitizing without allowing arbitrary styling or handlers', async () => {
  const { renderEditorialBody } = await import('../../src/lib/server/editorial.mjs');
  const html = renderEditorialBody('<div class="featured-guide-row untrusted"><div class="featured"><div class="featured-content"><h5 class="section-title guide" onclick="alert(1)">Food</h5><div class="address">Boston</div><a class="featured-site" href="https://example.org" style="position:fixed" onclick="alert(1)">Website</a></div></div></div>', '/summit/boston-2017/boston-city-guide/');
  for (const name of ['featured-guide-row', 'featured-content', 'section-title guide', 'address', 'featured-site']) assert.ok(html.includes(`class="${name}"`), name);
  assert.doesNotMatch(html, /untrusted|onclick|position:fixed/);
});

test('City-guide icon markup is decorative while section links retain accessible text', async () => {
  const { renderEditorialBody } = await import('../../src/lib/server/editorial.mjs');
  const html = renderEditorialBody('<div class="guide-icons-wrapper"><a class="guide-icons" href="#food"><i class="fa fa-cutlery arbitrary" onclick="alert(1)"></i>Food</a></div>', '/summit/boston-2017/boston-city-guide/');
  assert.match(html, /class="guide-icons-wrapper"/);
  assert.match(html, /href="#food"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /class="fa fa-cutlery"/);
  assert.doesNotMatch(html, /arbitrary|onclick/);
  assert.deepEqual(inspectContent(`<main>${html}</main>`), []);
});

test('Editorial images use the same explicit base as links without retaining executable URLs', async () => {
  const { renderEditorialBody } = await import('../../src/lib/server/editorial.mjs');
  const source = '<a href="assets/diagram.jpg"><img src="assets/diagram.jpg" onerror="alert(1)"></a>';
  assert.match(renderEditorialBody(source, '/'), /src="\/assets\/diagram.jpg"/);
  assert.match(renderEditorialBody(source, '/example/'), /src="\/example\/assets\/diagram.jpg"/);
  const unsafe = renderEditorialBody('<img src="javascript:alert(1)"><img src="https://example.org/image.jpg">', '/');
  assert.doesNotMatch(unsafe, /javascript:|onerror/);
  assert.match(unsafe, /src="https:\/\/example.org\/image.jpg"/);
});


test('Static control review recognizes labels, explicit names and native action values', () => {
  assert.deepEqual(inspectContent('<main><label for="email">Email</label><input id="email"><label>Notes<textarea></textarea></label><button aria-label="Close"></button><input type="submit"><input type="reset"><input type="button" value="Continue"><input type="image" alt="Search"><input type="hidden"><h2>Details</h2></main>'), []);
  assert.deepEqual(inspectContent('<main><input placeholder="Email"><select><option>Choose one</option></select><textarea>Existing answer</textarea><button><img alt=""></button><h3> </h3></main>'), [
    {kind:'unnamed-control',tag:'input',type:null,id:null},
    {kind:'unnamed-control',tag:'select',type:null,id:null},
    {kind:'unnamed-control',tag:'textarea',type:null,id:null},
    {kind:'unnamed-control',tag:'button',type:null,id:null},
    {kind:'empty-heading',tag:'h3'},
  ]);
});
