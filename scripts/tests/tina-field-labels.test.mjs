import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import renderer from 'react-test-renderer';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source = readFileSync(require.resolve('tinacms'), 'utf8');
test('Toggle uses its field name for the accessible checkbox and hides its decorative label', () => {
  const start = source.indexOf('const Toggle = (');
  const end = source.indexOf('\nconst ToggleInput', start);
  assert.ok(start >= 0 && end > start);
  const Toggle = new Function('React', 'ToggleInput', `${source.slice(start, end)}; return Toggle;`)(React, 'input');
  const view = renderer.create(React.createElement(Toggle, { input: { name: 'newsletter.display', value: true, checked: true }, field: {} }));
  assert.equal(view.root.findByType('input').props.id, 'newsletter.display');
  assert.equal(view.root.findByType('input').props.checked, true);
  assert.equal(view.root.findByType('label').props.htmlFor, 'newsletter.display');
  assert.equal(view.root.findByType('label').props['aria-hidden'], true);
  assert.equal(view.root.findByType('label').props.role, undefined);
  view.unmount();
});
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

test('Media actions identify the field and clear only its selection', () => {
  const start = source.indexOf('const ImageUpload =');
  const end = source.indexOf('\nconst ImageLoadingIndicator', start);
  assert.ok(start >= 0 && end > start);
  const ImageUpload = new Function('React', 'useCMS', 'useDropzone$1',
    'dropzoneAcceptFromExtensions', 'resolveMediaAccept', 'dropzoneAcceptFromString',
    'DEFAULT_MEDIA_UPLOAD_TYPES', 'isImage', 'StyledImage', 'StyledFile', 'IconButton', 'TrashIcon',
    `${source.slice(start, end)}; return ImageUpload;`)(React,
    () => ({ media: {} }), () => ({ getRootProps: () => ({}), getInputProps: () => ({}) }),
    () => undefined, () => [], () => undefined, '', () => true, 'img', 'span', 'button', 'svg');
  let clears = 0;
  let choices = 0;
  const props = { label: 'Decorative section background', value: '/image.jpg', src: '/image.jpg',
    onClick: () => choices++, onClear: () => clears++ };
  const view = renderer.create(React.createElement(ImageUpload, props));
  const buttons = view.root.findAllByType('button');
  assert.deepEqual(buttons.map(b => b.props['aria-label']), [
    'Choose media for Decorative section background', 'Clear Decorative section background selection',
  ]);
  assert.ok(buttons.every(b => b.props.type === 'button'));
  buttons[0].props.onClick();
  let stopped = false;
  buttons[1].props.onClick({ stopPropagation() { stopped = true; } });
  assert.equal(choices, 1);
  assert.equal(clears, 1);
  assert.equal(stopped, true);
  view.update(React.createElement(ImageUpload, { ...props, value: '' }));
  const empty = view.root.findByType('button');
  assert.equal(empty.props['aria-label'], 'Choose media for Decorative section background');
  assert.equal(empty.props.type, 'button');
  view.unmount();
});
