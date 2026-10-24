import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const path = require.resolve('tinacms');
const { version } = JSON.parse(readFileSync(join(dirname(path), '../package.json'), 'utf8'));
if (version !== '3.13.0')
  throw new Error('Review Tina list keyboard patch before changing versions.');
let source = readFileSync(path, 'utf8');
const marker = '// OpenStack: keep drag focus and keyboard listeners on the same handle.';
if (!source.includes(marker)) {
  const before = `        ref: setNodeRef,
        style,
        ...attributes
      },
      dragHandleProps: {
        ref: setActivatorNodeRef,
        ...listeners2`;
  const after = `        ref: setNodeRef,
        style
      },
      dragHandleProps: {
        ${marker}
        ref: setActivatorNodeRef,
        ...attributes,
        "aria-label": "Reorder list item",
        ...listeners2`;
  if (source.split(before).length !== 2)
    throw new Error('Unexpected Tina drag source; review patch.');
  source = source.replace(before, after);
  const target = `const ItemClickTarget = ({ children, ...props }) => {
  return /* @__PURE__ */ React__default.createElement(
    "div",
    {`;
  if (source.split(target).length !== 2)
    throw new Error('Unexpected Tina item edit source; review patch.');
  source = source.replace(
    target,
    target +
      `
      role: "button",
      tabIndex: 0,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onClick?.(event);
        }
      },`,
  );
  writeFileSync(path, source);
}

// Tina 3.13 renders list Add/Remove icons without accessible names. Keep the
// field label and one-based row number available to assistive technology.
const controlsMarker =
  '// OpenStack: name list actions and enforce minimum length for keyboard users.';
if (!source.includes(controlsMarker)) {
  const replaceExact = (before, after, count) => {
    if (source.split(before).length !== count + 1)
      throw new Error('Unexpected Tina list action source; review patch.');
    source = source.split(before).join(after);
  };
  replaceExact(
    '"data-test": `add-item-${field.name}`,',
    '"aria-label": `Add ${field.label || field.name} item`,\n          "data-test": `add-item-${field.name}`,',
    2,
  );
  replaceExact(
    '"data-test": fieldName ? `add-item-${fieldName}` : void 0,',
    '"aria-label": `Add ${fieldName || "list"} item`,\n      "data-test": fieldName ? `add-item-${fieldName}` : void 0,',
    2,
  );
  const removeCalls = /onClick: removeItem,\n(\s*)fieldName: `\$\{field.name\}\.\$\{index\}`/g;
  if ([...source.matchAll(removeCalls)].length !== 4)
    throw new Error('Unexpected Tina remove call sites; review patch.');
  source = source.replace(
    removeCalls,
    (_, indent) =>
      'onClick: removeItem,\n' +
      indent +
      'label: `Remove ${field.label || field.name} item ${index + 1}`,\n' +
      indent +
      'fieldName: `${field.name}.${index}`',
  );
  replaceExact(
    'const ItemDeleteButton = ({\n  onClick,\n  disabled = false,\n  fieldName = ""',
    `const ItemDeleteButton = ({\n  ${controlsMarker}\n  onClick,\n  disabled = false,\n  label = "Remove list item",\n  fieldName = ""`,
    1,
  );
  replaceExact(
    '"data-test": fieldName ? `delete-item-${fieldName}` : "delete-item",',
    '"aria-label": label,\n      disabled,\n      "data-test": fieldName ? `delete-item-${fieldName}` : "delete-item",',
    1,
  );
  writeFileSync(path, source);
}
