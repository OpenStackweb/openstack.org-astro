import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const origin = 'https://review.example';
const cliRequire = createRequire(require.resolve('@tinacms/cli/package.json'));
const appDirectory = dirname(cliRequire.resolve('@tinacms/app/package.json'));
const appSource = (name) => readFileSync(join(appDirectory, 'src/lib', name), 'utf8');
const tinaSource = readFileSync(require.resolve('tinacms'), 'utf8');
function previewResolver() {
  const start = tinaSource.indexOf('function resolvePreviewPath(');
  const end = tinaSource.indexOf('\nconst getBackendType', start);
  assert.ok(start >= 0 && end > start);
  return runInNewContext(tinaSource.slice(start, end) + '\nresolvePreviewPath', {
    URL,
    window: { location: { origin } },
  });
}
function messageGuards() {
  const compiled = ts.transpileModule(appSource('preview-origin.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  runInNewContext(compiled.outputText, { exports, window: { location: { origin } } });
  return exports;
}

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
  const exports = messageGuards();
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

test('installed PreviewInner uses the origin guard before rendering its iframe', () => {
  const start = tinaSource.indexOf('const PreviewInner =');
  const end = tinaSource.indexOf('\nconst CheckSchema', start);
  assert.ok(start >= 0 && end > start);
  for (const [splat, expectedPath] of [
    ['user-survey/', '/user-survey/'],
    ['/other.example/page', '/'],
  ]) {
    const PreviewInner = runInNewContext(tinaSource.slice(start, end) + '\nPreviewInner', {
      React__default: React,
      useState: React.useState,
      useCMS$1: () => ({ alerts: { warn() {} } }),
      useParams: () => ({ '*': splat }),
      useNavigate: () => () => {},
      resolvePreviewPath: previewResolver(),
      AnnouncementsBanner: () => null,
      setInterval: () => 0,
      URL,
    });
    let view;
    act(() => {
      view = create(
        React.createElement(PreviewInner, {
          preview: ({ url }) => React.createElement('iframe', { src: url }),
          config: {},
        }),
      );
    });
    assert.equal(view.root.findByType('iframe').props.src, expectedPath);
    act(() => view.unmount());
  }
});

test('installed message callback rejects untrusted senders before reading their payload', () => {
  const source = appSource('graphql-reducer.ts');
  const file = ts.createSourceFile('graphql-reducer.ts', source, ts.ScriptTarget.Latest, true);
  let callback;
  let expectedOrigin;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'handleMessage') {
      callback = node.initializer.arguments[0];
    }
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'expectedOrigin') {
      expectedOrigin = node.initializer.getText(file);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.ok(callback, 'Review message callback integration after upgrading Tina');
  assert.equal(expectedOrigin, 'getPreviewOrigin()');
  assert.match(source, /window\.addEventListener\('message', handleMessage\)/);
  const compiled = ts.transpileModule('const handler = ' + callback.getText(file), {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  });
  const messages = [];
  const peer = { postMessage: (...args) => messages.push(args) };
  const handler = runInNewContext(compiled.outputText + '\nhandler', {
    ...messageGuards(),
    expectedOrigin: origin,
    iframe: { current: { contentWindow: peer } },
  });
  for (const event of [
    { origin: 'https://other.example', source: peer },
    { origin, source: {} },
  ]) {
    Object.defineProperty(event, 'data', {
      get() {
        throw Error('Untrusted payload read');
      },
    });
    assert.doesNotThrow(() => handler(event));
  }
  handler({ origin, source: peer, data: { type: 'isEditMode' } });
  assert.equal(messages.length, 1);
  assert.equal(messages[0][0].type, 'tina:editMode');
  assert.equal(messages[0][1], origin);
});
