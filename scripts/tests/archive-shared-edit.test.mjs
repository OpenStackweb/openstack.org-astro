import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import content from '../../src/lib/server/archive-event-content.mjs';
import { withArchiveEvent } from '../../src/lib/server/archive-events.mjs';
import { prepareEditorialPage } from '../../src/lib/server/editorial.mjs';

test('A shared event draft updates every consumer without changing other events or page copy', () => {
  const edited = structuredClone(content);
  const event = edited.events.find(event => event.id === 'vancouver-2015');
  event.introduction = 'Shared introduction verification';
  event.navigation = [{ label: 'Shared link verification', url: '/community/' }];
  const directory = new URL('../../src/lib/content/pages/', import.meta.url);
  let affected = 0;
  let unchanged = 0;
  for (const filename of readdirSync(directory)) {
    const page = JSON.parse(readFileSync(new URL(filename, directory), 'utf8'));
    if (!page.archiveEvent) continue;
    const before = withArchiveEvent(prepareEditorialPage(page));
    const after = withArchiveEvent(prepareEditorialPage(page), edited);
    if (page.archiveEvent === event.id) {
      assert.match(after.archiveIntroductionHtml, /Shared introduction verification/);
      assert.equal(after.sectionNavigation[0].label, 'Shared link verification');
      assert.equal(after.html, before.html);
      affected++;
    } else {
      assert.deepEqual(after, before);
      unchanged++;
    }
  }
  assert.equal(affected, 15);
  assert.equal(unchanged, 46);
});
