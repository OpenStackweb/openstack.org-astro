import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer from 'react-test-renderer';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// Tina's complete browser bundle cannot be imported directly in Node because
// one transitive CommonJS package exposes browser-bundler-only named exports.
const source = readFileSync(require.resolve('tinacms'), 'utf8');
const component = source.match(/const ItemDeleteButton = ([\s\S]*?)\n};/);
assert.ok(component, 'Pinned Tina delete component is available');
const ItemDeleteButton = new Function('React__default', 'TrashIcon', `return ${component[1]}\n};`)(React, () => null);

// Exercise the installed component after the pinned postinstall patch, not a
// duplicate implementation of its props. Native disabled prevents activation.
test('list removal exposes its action and enforces the minimum-length state', () => {
  const view = renderer.create(React.createElement(ItemDeleteButton, {
    label: 'Remove Photos item 2', disabled: true, fieldName: 'photos.1', onClick() {},
  }));
  const button = view.root.findByType('button');
  assert.equal(button.props['aria-label'], 'Remove Photos item 2');
  assert.equal(button.props.disabled, true);
  view.update(React.createElement(ItemDeleteButton, {
    label: 'Remove Photos item 2', disabled: false, fieldName: 'photos.1', onClick() {},
  }));
  assert.equal(view.root.findByType('button').props.disabled, false);
  view.unmount();
});
