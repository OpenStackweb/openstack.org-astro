import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateNavigation } from '../../tina/navigation-validation.mjs';
const content = JSON.parse(readFileSync(new URL('../../src/lib/content/navbar.json', import.meta.url)));
test('Navigation preserves stored dividers, nested entries and service destinations', () => {
  assert.equal(validateNavigation(content), content);
  const edited = structuredClone(content);
  edited.items.reverse();
  edited.items[0].title = 'Changed label';
  assert.equal(validateNavigation(edited), edited);
  assert.ok(content.items[0].items[0].items.length);
});
test('Navigation submission rejects unsafe links and incomplete entries', () => {
  assert.throws(() => validateNavigation({ items: [{ title: 'Unsafe', link: 'javascript:alert(1)' }] }));
  assert.throws(() => validateNavigation({ items: [{ title: 'Menu', link: '#', items: [{ title: 'Missing URL' }] }] }));
  assert.doesNotThrow(() => validateNavigation({ items: [{ title: 'Menu', link: '#', items: [{ title: null, link: null }] }] }));
});
