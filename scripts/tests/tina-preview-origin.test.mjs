import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const origin = 'https://review.example';

test('installed Tina preview normalizes local paths and refuses external iframe origins', () => {
  const source = readFileSync(require.resolve('tinacms'), 'utf8');
  const start = source.indexOf('function resolvePreviewPath(');
  const end = source.indexOf('\nconst getBackendType', start);
  assert.ok(start >= 0 && end > start, 'Review the installed Tina preview guard after upgrades');
  const resolve = runInNewContext(source.slice(start, end) + '\nresolvePreviewPath', { URL });
  for (const path of ['user-survey/', 'use-cases/science/?preview=1#section']) {
    const result = resolve(path, origin);
    assert.equal(result.path, '/' + path);
    assert.equal(result.offOrigin, false);
  }
  for (const path of ['/other.example/page', '\\other.example/page', '//other.example/page']) {
    const result = resolve(path, origin);
    assert.equal(result.path, '/');
    assert.equal(result.offOrigin, true);
  }
});

test('installed Tina message guard trusts only this origin and the actual preview window', () => {
  const source = readFileSync(
    new URL('../../node_modules/@tinacms/app/src/lib/preview-origin.ts', import.meta.url),
    'utf8',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  runInNewContext(compiled.outputText, { exports, window: { location: { origin } } });
  assert.equal(exports.getPreviewOrigin(), origin);
  const peer = {};
  const trusted = (event) =>
    exports.isFromTrustedPreviewOrigin({ event, expectedOrigin: origin, peerWindow: peer });
  assert.equal(trusted({ origin, source: peer }), true);
  assert.equal(trusted({ origin: 'https://other.example', source: peer }), false);
  assert.equal(trusted({ origin, source: {} }), false);
  let sent;
  exports.postMessageToPreview(
    {
      postMessage: (...args) => {
        sent = args;
      },
    },
    { type: 'synthetic' },
    origin,
  );
  assert.equal(sent[1], origin);
});
