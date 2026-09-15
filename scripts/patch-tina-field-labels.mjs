import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const path = require.resolve('tinacms');
const { version } = JSON.parse(readFileSync(join(dirname(path), '../package.json'), 'utf8'));
if (version !== '3.13.0') throw new Error('Review Tina field label patch before changing versions.');
let source = readFileSync(path, 'utf8');
const replacements = [
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
writeFileSync(path, source);
