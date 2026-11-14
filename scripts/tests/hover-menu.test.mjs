import test from 'node:test';
import assert from 'node:assert/strict';
import { hoverMenu } from '../../src/lib/actions/hover-menu.js';

test('Safari focus loss before a touch click leaves the submenu link available', () => {
  const node = new EventTarget();
  const link = {};
  node.open = true;
  node.contains = (target) => target === link;
  const menu = hoverMenu(node);
  const blur = (relatedTarget) => {
    const event = new Event('focusout');
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
    node.dispatchEvent(event);
  };
  blur(null);
  assert.equal(node.open, true);
  blur(link);
  assert.equal(node.open, true);
  blur({});
  assert.equal(node.open, false, 'keyboard focus leaving the menu still closes it');
  menu.destroy();
});
