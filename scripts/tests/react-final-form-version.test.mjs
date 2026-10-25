import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReactFinalFormVersion } from '../check-react-final-form.mjs';

test('Final Form upgrade guard blocks the previously regressed major and later versions', () => {
  assert.doesNotThrow(() => checkReactFinalFormVersion('6.5.9'));
  for (const version of ['7.0.1', '7.1.0', '8.0.0', 'invalid']) {
    assert.throws(() => checkReactFinalFormVersion(version), /Review React Final Form remount/);
  }
});
