import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const path = require.resolve('tinacms');
const { version } = JSON.parse(readFileSync(join(dirname(path), '../package.json'), 'utf8'));
if (version !== '3.13.0') throw new Error('Review Tina list keyboard patch before changing versions.');
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
  if (source.split(before).length !== 2) throw new Error('Unexpected Tina drag source; review patch.');
  source = source.replace(before, after);
  const target = `const ItemClickTarget = ({ children, ...props }) => {
  return /* @__PURE__ */ React__default.createElement(
    "div",
    {`;
  if (source.split(target).length !== 2) throw new Error('Unexpected Tina item edit source; review patch.');
  source = source.replace(target, target + `
      role: "button",
      tabIndex: 0,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.onClick?.(event);
        }
      },`);
  writeFileSync(path, source);
}
