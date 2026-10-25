import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const tinaRequire = createRequire(require.resolve('tinacms'));

export function checkReactFinalFormVersion(version) {
  const major = Number(version.split('.')[0]);
  if (!Number.isInteger(major) || major < 1 || major >= 7) {
    throw Error('Review React Final Form remount behavior before using version ' + version);
  }
}

// Resolve Tina's own dependency, including when npm nests it below Tina.
checkReactFinalFormVersion(tinaRequire('react-final-form/package.json').version);
