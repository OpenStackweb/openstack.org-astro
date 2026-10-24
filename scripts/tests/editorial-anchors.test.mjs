import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEditorialBody } from '../../src/lib/server/editorial.mjs';

test('legacy named anchors survive sanitization as fragment destinations', () => {
  const html = renderEditorialBody(
    '<h4><a name="Environmental_Considerations"></a>Environmental considerations</h4>' +
      '<p><a href="#Environmental_Considerations">found above</a></p>',
    '/research/',
  );
  assert.match(html, /<a id="Environmental_Considerations"><\/a>/);
  assert.match(html, /href="#Environmental_Considerations"/);
  assert.doesNotMatch(html, /name=/);
});

test('anchor conversion retains explicit IDs and still strips executable attributes', () => {
  const html = renderEditorialBody(
    '<a id="current" name="old" onclick="alert(1)" href="javascript:alert(1)">Text</a>',
    '/research/',
  );
  assert.match(html, /id="current"/);
  assert.doesNotMatch(html, /id="old"|name=|onclick|javascript:/);
});
