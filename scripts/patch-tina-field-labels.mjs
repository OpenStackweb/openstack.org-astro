import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const path = require.resolve('tinacms');
const { version } = JSON.parse(readFileSync(join(dirname(path), '../package.json'), 'utf8'));
if (version !== '3.13.0') throw new Error('Review Tina field label patch before changing versions.');
let source = readFileSync(path, 'utf8');
const replacements = [
  ['const Toggle = ({\n  input,\n  field,\n  name: name2,',
   'const Toggle = ({\n  input,\n  field,\n  name: name2 = input.name,'],
  ['htmlFor: name2,\n      role: "switch"',
   'htmlFor: name2,\n      "aria-hidden": true'],
  ['React.createElement(TextArea, { ref, ...props.input });',
   'React.createElement(TextArea, { ref, ...props.input, id: props.input.name });'],
  ['BaseTextField,\n      {\n        ...props.input,\n        ref,',
   'BaseTextField,\n      {\n        ...props.input,\n        id: props.input.name,\n        ref,'],
];
for (const [before, after] of replacements) {
  if (source.includes(after)) continue;
  if (source.split(before).length !== 2) throw new Error('Unexpected Tina text field source; review label patch.');
  source = source.replace(before, after);
}
// Label media actions with their field context. Clearing removes the reference,
// not the stored object; keep that distinction explicit to editors.
const mediaReplacements = [
  ['src, loading, accept }, ref) => {', 'src, loading, accept, label = "Media" }, ref) => {'],
  ['        onClick,\n        ref\n      },\n      isImage(src)',
   '        onClick,\n        ref,\n        type: "button",\n        "aria-label": `Choose media for ${label}`\n      },\n      isImage(src)'],
  ['    onClear && /* @__PURE__ */ React.createElement(\n      DeleteImageButton,\n      {\n        onClick:',
   '    onClear && /* @__PURE__ */ React.createElement(\n      DeleteImageButton,\n      {\n        label: `Clear ${label} selection`,\n        onClick:'],
  ['className: "outline-none relative hover:opacity-60 w-full",\n      onClick',
   'className: "outline-none relative hover:opacity-60 w-full",\n      type: "button",\n      "aria-label": `Choose media for ${label}`,\n      onClick'],
  ['const DeleteImageButton = ({\n  onClick\n}) => {',
   'const DeleteImageButton = ({\n  onClick, label = "Clear media selection"\n}) => {'],
  ['IconButton, { variant: "white", className: "flex-none", onClick },',
   'IconButton, { variant: "white", className: "flex-none", type: "button", "aria-label": label, onClick },'],
  ['        loading: isImgUploading,\n        accept: props.field.accept,',
   '        loading: isImgUploading,\n        label: props.field.label || props.input.name,\n        accept: props.field.accept,'],
];
for (const [before, after] of mediaReplacements) {
  const start = before.includes("isImgUploading") ? source.indexOf("const ImageField =") : source.indexOf("const ImageUpload =");
  const end = before.includes("isImgUploading") ? source.indexOf("const ImageFieldPlugin", start) : source.indexOf("const ImageLoadingIndicator", start);
  let scope = source.slice(start, end);
  if (scope.includes(after)) continue;
  if (scope.split(before).length !== 2) throw new Error(`Unexpected Tina media source (${before.slice(0, 90)}); review label patch.`);
  scope = scope.replace(before, after);
  source = source.slice(0, start) + scope + source.slice(end);
}
writeFileSync(path, source);
