import test from 'node:test';
import assert from 'node:assert/strict';
import { publicNavigation } from '../src/lib/public-navigation.mjs';
test('anonymous navigation exports absolute public links and separators, not auth or hidden entries', () => {
  const feed = publicNavigation({
    items: [
      {
        title: 'Use Cases',
        link: '/use-cases/',
        items: [
          { title: 'NFV', link: '/use-cases/telecoms-and-nfv/' },
          { title: null, link: null },
          { title: 'Hidden', link: '/hidden', display: false },
          { title: 'Private', link: '/private', requiresAuth: true },
          { title: 'Unsafe', link: 'javascript:alert(1)' },
        ],
      },
    ],
  });
  assert.equal(feed.version, 1);
  assert.equal(feed.items[0].link, 'https://www.openstack.org/use-cases/');
  assert.deepEqual(feed.items[0].items, [
    { title: 'NFV', link: 'https://www.openstack.org/use-cases/telecoms-and-nfv/' },
    { separator: true },
  ]);
  assert.equal(feed.items.at(-1).title, 'Join');
});
