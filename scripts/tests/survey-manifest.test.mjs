import test from 'node:test';
import assert from 'node:assert/strict';
import { surveyAssets } from '../../src/lib/survey/manifest.mjs';
import { isSurveyAssetPath, MOUNT } from '../../src/lib/survey/paths.mjs';
import { permittedPath } from '../../src/lib/survey/gateway.mjs';

test('survey assets stay under the same-origin gateway', () => {
  assert.deepEqual(surveyAssets({ script: 'static/app-v1.js', styles: ['static/css/app.css'] }), {
    script: '/user-survey/service/static/app-v1.js',
    styles: ['/user-survey/service/static/css/app.css'],
  });
  assert.deepEqual(surveyAssets({ script: 'static/app.js', styles: [] }).styles, []);
});

test('survey manifest rejects malformed data, excessive styles and unsafe asset paths', () => {
  for (const manifest of [
    null,
    {},
    { script: 12, styles: [] },
    { script: 'static/app.css', styles: [] },
    { script: 'static/app.js', styles: Array(11).fill('static/app.css') },
  ]) {
    assert.throws(() => surveyAssets(manifest));
  }
  for (const path of [
    'https://other.example/app.js',
    '//other.example/app.js',
    '/static/app.js',
    'static/../app.js',
    'static/./app.js',
    'static/%2e%2e/app.js',
    'static/app.js?x=1',
    'static/app.js#x',
    'static/\\app.js',
    null,
  ]) {
    assert.throws(() => surveyAssets({ script: path, styles: [] }), String(path));
    assert.throws(() => surveyAssets({ script: 'static/app.js', styles: [path] }), String(path));
  }
});

test('manifest asset decisions match the gateway for valid paths and traversal lookalikes', () => {
  for (const path of [
    'static/app.js',
    'static/css/app.css',
    'static/a-b_2.js',
    'static//app.js',
    'static/./app.js',
    'static/../app.js',
    'static/%2e/app.js',
    'static/\\app.js',
    'static/app.css?x=1',
    'static/app.css#x',
    '/static/app.js',
    'https://other.example/app.js',
  ]) {
    const allowed = isSurveyAssetPath('/' + path);
    assert.equal(permittedPath('/' + path, 'GET'), allowed, path);
    const manifest = { script: 'static/app.js', styles: [path] };
    if (allowed) assert.equal(surveyAssets(manifest).styles[0], MOUNT + '/' + path);
    else assert.throws(() => surveyAssets(manifest), path);
  }
});
