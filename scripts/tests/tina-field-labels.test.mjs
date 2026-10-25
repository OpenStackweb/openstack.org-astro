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
  const Toggle = new Function(
    'React',
    'ToggleInput',
    `${source.slice(start, end)}; return Toggle;`,
  )(React, 'input');
  const view = renderer.create(
    React.createElement(Toggle, {
      input: { name: 'newsletter.display', value: true, checked: true },
      field: {},
    }),
  );
  assert.equal(view.root.findByType('input').props.id, 'newsletter.display');
  assert.equal(view.root.findByType('input').props.checked, true);
  assert.equal(view.root.findByType('label').props.htmlFor, 'newsletter.display');
  assert.equal(view.root.findByType('label').props['aria-hidden'], true);
  assert.equal(view.root.findByType('label').props.role, undefined);
  view.unmount();
});
for (const [name, element] of [
  ['TextField', 'input'],
  ['TextareaField', 'textarea'],
]) {
  // Exercise installed Tina render functions, retaining their hooks and props.
  const start = source.indexOf(`const ${name} = `);
  const end = source.indexOf(`\nconst ${name}Plugin`, start);
  assert.ok(start >= 0 && end > start);
  const component = new Function(
    'React',
    'wrapFieldsWithMeta',
    'BaseTextField',
    'TextArea',
    `${source.slice(start, end)}; return ${name};`,
  )(React, (x) => x, 'input', 'textarea');
  test(`${name} associates nested field names with its visible label target`, () => {
    const view = renderer.create(
      React.createElement(component, {
        input: { name: 'hero.title', value: 'Original', onChange() {} },
        field: {},
      }),
    );
    assert.equal(view.root.findByType(element).props.id, 'hero.title');
    view.update(
      React.createElement(component, {
        input: { name: 'cards.2.title', value: 'Nested', onChange() {} },
        field: {},
      }),
    );
    assert.equal(view.root.findByType(element).props.id, 'cards.2.title');
    assert.equal(view.root.findByType(element).props.value, 'Nested');
    view.unmount();
  });
}

test('Media actions identify the field and clear only its selection', () => {
  const start = source.indexOf('const ImageUpload =');
  const end = source.indexOf('\nconst ImageLoadingIndicator', start);
  assert.ok(start >= 0 && end > start);
  const ImageUpload = new Function(
    'React',
    'useCMS',
    'useDropzone$1',
    'dropzoneAcceptFromExtensions',
    'resolveMediaAccept',
    'dropzoneAcceptFromString',
    'DEFAULT_MEDIA_UPLOAD_TYPES',
    'isImage',
    'StyledImage',
    'StyledFile',
    'IconButton',
    'TrashIcon',
    `${source.slice(start, end)}; return ImageUpload;`,
  )(
    React,
    () => ({ media: {} }),
    () => ({ getRootProps: () => ({}), getInputProps: () => ({}) }),
    () => undefined,
    () => [],
    () => undefined,
    '',
    () => true,
    'img',
    'span',
    'button',
    'svg',
  );
  let clears = 0;
  let choices = 0;
  const props = {
    label: 'Decorative section background',
    value: '/image.jpg',
    src: '/image.jpg',
    onClick: () => choices++,
    onClear: () => clears++,
  };
  const view = renderer.create(React.createElement(ImageUpload, props));
  const buttons = view.root.findAllByType('button');
  assert.deepEqual(
    buttons.map((b) => b.props['aria-label']),
    [
      'Choose media for Decorative section background',
      'Clear Decorative section background selection',
    ],
  );
  assert.ok(buttons.every((b) => b.props.type === 'button'));
  buttons[0].props.onClick();
  let stopped = false;
  buttons[1].props.onClick({
    stopPropagation() {
      stopped = true;
    },
  });
  assert.equal(choices, 1);
  assert.equal(clears, 1);
  assert.equal(stopped, true);
  view.update(React.createElement(ImageUpload, { ...props, value: '' }));
  const empty = view.root.findByType('button');
  assert.equal(empty.props['aria-label'], 'Choose media for Decorative section background');
  assert.equal(empty.props.type, 'button');
  view.unmount();
});

test('Media dialog closes with Escape, traps Tab and restores opener focus', () => {
  const start = source.indexOf('function MediaManagerDialog(');
  const end = source.indexOf('function MediaManager2()', start);
  assert.ok(start >= 0 && end > start);
  const doc = { activeElement: null };
  class Element {
    constructor() {
      this.isConnected = true;
      this.tabIndex = 0;
    }
    focus() {
      doc.activeElement = this;
    }
    getClientRects() {
      return [{}];
    }
  }
  const opener = new Element();
  const first = new Element();
  const last = new Element();
  opener.focus();
  const root = new Element();
  root.querySelector = () => first;
  root.querySelectorAll = () => [first, last];
  root.contains = (target) => [root, first, last].includes(target);
  const Component = new Function(
    'React',
    'document',
    'HTMLElement',
    `${source.slice(start, end)}; return MediaManagerDialog;`,
  )(React, doc, Element);
  let closed = 0;
  let view;
  renderer.act(() => {
    view = renderer.create(React.createElement(Component, { close: () => closed++ }), {
      createNodeMock: () => root,
    });
  });
  assert.equal(doc.activeElement, first);
  const dialog = view.root.findByType('div');
  assert.equal(dialog.props.role, 'dialog');
  assert.equal(dialog.props['aria-label'], 'Media Manager');
  const key = (key, target, shiftKey = false) => {
    let prevented = false;
    dialog.props.onKeyDown({
      key,
      target,
      shiftKey,
      preventDefault() {
        prevented = true;
      },
      stopPropagation() {},
    });
    return prevented;
  };
  last.focus();
  assert.equal(key('Tab', last), true);
  assert.equal(doc.activeElement, first);
  assert.equal(key('Tab', first, true), true);
  assert.equal(doc.activeElement, last);
  assert.equal(key('Escape', new Element()), false);
  assert.equal(closed, 0);
  assert.equal(key('Escape', last), true);
  assert.equal(closed, 1);
  renderer.act(() => view.unmount());
  assert.equal(doc.activeElement, opener);
});

test('disabled Tina text inputs are natively disabled, not only styled', () => {
  const start = source.indexOf('const BaseTextField = ');
  const end = source.indexOf('\nconst TextArea = ', start);
  assert.ok(start >= 0 && end > start);
  const Component = new Function(
    'React',
    'textFieldClasses',
    'disabledClasses$1',
    `${source.slice(start, end)}; return BaseTextField;`,
  )(React, 'text', 'disabled');
  const view = renderer.create(
    React.createElement(Component, { disabled: true, name: 'filename', value: 'gazpacho' }),
  );
  assert.equal(view.root.findByType('input').props.disabled, true);
  assert.equal(view.root.findByType('input').props.value, 'gazpacho');
  view.update(
    React.createElement(Component, { disabled: false, name: 'title', value: 'Editable' }),
  );
  assert.equal(view.root.findByType('input').props.disabled, false);
  view.unmount();
});
