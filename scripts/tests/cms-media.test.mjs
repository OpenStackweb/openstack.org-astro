import test from 'node:test';
import assert from 'node:assert/strict';
import { fileType, proofMediaKey } from '../../src/lib/server/cms-media.mjs';
test('uploads reject active content and restrict immutable object keys', () => {
  assert.equal(fileType(new TextEncoder().encode('<svg onload="alert(1)">')), null);
  assert.equal(fileType(new TextEncoder().encode('<html>')), null);
  assert.equal(proofMediaKey('legacy/' + 'a'.repeat(64)), false);
  assert.equal(proofMediaKey('cms-proof/../other.png'), false);
  assert.equal(proofMediaKey('cms-proof/' + 'a'.repeat(64) + '.png'), true);
});
