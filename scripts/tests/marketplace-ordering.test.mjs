import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffled } from '../../src/lib/marketplace/ordering.mjs';

test('provider ordering preserves records and source order while allowing equal-exposure rotation', () => {
  const source = Object.freeze([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  const result = shuffled(source, () => 0);
  assert.deepEqual(
    result.map((item) => item.id),
    [2, 3, 4, 1],
  );
  assert.deepEqual(
    source.map((item) => item.id),
    [1, 2, 3, 4],
  );
  assert.deepEqual(new Set(result), new Set(source));
  assert.deepEqual(shuffled([]), []);
  assert.deepEqual(shuffled([source[0]]), [source[0]]);
});
