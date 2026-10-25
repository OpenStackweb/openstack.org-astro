import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const directory = dirname(require.resolve('react-final-form/package.json'));
const { version } = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
if (version !== '7.0.1')
  throw new Error('Review the React Final Form remount patch before changing versions.');
const marker =
  '// OpenStack: let Final Form register fields without overwriting retained draft values.';
for (const filename of ['react-final-form.cjs.js', 'react-final-form.es.js']) {
  const path = join(directory, 'dist', filename);
  const source = readFileSync(path, 'utf8');
  if (source.includes(marker)) continue;
  const start = source.indexOf('    // Check if field state exists in the form before registering');
  const end = source.indexOf('    // Register field after the initial render', start);
  if (start < 0 || end < 0 || !source.slice(start, end).includes('form.change(name, valueToSet);'))
    throw new Error(`Unexpected React Final Form source in ${filename}; review patch.`);
  writeFileSync(path, source.slice(0, start) + '    ' + marker + '\n\n' + source.slice(end));
}
