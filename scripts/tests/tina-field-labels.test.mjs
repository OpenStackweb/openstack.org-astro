import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer from 'react-test-renderer';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source = readFileSync(require.resolve('tinacms'), 'utf8');
for (const [name, element] of [['TextField', 'input'], ['TextareaField', 'textarea']]) {
  // Exercise installed Tina render functions, retaining their hooks and props.
  const start = source.indexOf(`const ${name} = `);
  const end = source.indexOf(`\nconst ${name}Plugin`, start);
  assert.ok(start >= 0 && end > start);
  const component = new Function('React', 'wrapFieldsWithMeta', 'BaseTextField', 'TextArea',
    `${source.slice(start, end)}; return ${name};`)(React, x => x, 'input', 'textarea');
  test(`${name} associates nested field names with its visible label target`, () => {
    const view = renderer.create(React.createElement(component, {
      input: { name: 'hero.title', value: 'Original', onChange() {} }, field: {},
    }));
    assert.equal(view.root.findByType(element).props.id, 'hero.title');
    view.update(React.createElement(component, {
      input: { name: 'cards.2.title', value: 'Nested', onChange() {} }, field: {},
    }));
    assert.equal(view.root.findByType(element).props.id, 'cards.2.title');
    assert.equal(view.root.findByType(element).props.value, 'Nested');
    view.unmount();
  });
}
