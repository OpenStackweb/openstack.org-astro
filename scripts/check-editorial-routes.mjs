import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../src/lib/content/', import.meta.url);
const paths = new Set(JSON.parse(await readFile(new URL('editorial-paths.json', root), 'utf8')));
const seen = new Set();
for (const name of await readdir(new URL('pages/', root))) {
  if (!name.endsWith('.json')) continue;
  const page = JSON.parse(await readFile(new URL(`pages/${name}`, root), 'utf8'));
  assert.ok(paths.has(page.path), `Unregistered editorial route in ${name}: ${page.path}`);
  assert.ok(!seen.has(page.path), `Duplicate editorial route: ${page.path}`);
  seen.add(page.path);
}
console.log(`Editorial routes: ${seen.size} records registered without duplicates.`);
