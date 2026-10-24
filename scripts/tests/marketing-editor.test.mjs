import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareMarketing } from '../../src/lib/server/marketing-resources.mjs';
import { validateMarketing } from '../../tina/marketing-validation.mjs';
const content = JSON.parse(
  readFileSync(new URL('../../src/lib/content/marketing-resources.json', import.meta.url)),
);

test('marketing preview tolerates empty and unfinished repeated fields without modifying draft', () => {
  const draft = {
    title: '',
    sections: [
      null,
      { cards: [null, {}, { id: 'draft-0', resources: null }] },
      { id: 'draft-0', cards: null },
    ],
  };
  const before = structuredClone(draft);
  const result = prepareMarketing(draft);
  assert.deepEqual(draft, before);
  assert.equal(result.sections.length, 2);
  assert.notEqual(result.sections[0].id, result.sections[1].id);
  assert.equal(result.sections[1].id, 'draft-0');
  assert.notEqual(result.sections[0].cards[0].id, result.sections[0].cards[1].id);
  assert.equal(result.sections[0].cards[1].id, 'draft-0');
  assert.deepEqual(prepareMarketing({ sections: null }).sections, []);
});

test('unsafe draft destinations and malformed video IDs cannot become preview actions', () => {
  const draft = {
    sections: [
      {
        cards: [
          {
            image: 'javascript:alert(1)',
            action: { url: '//evil.example' },
            videoId: 'bad"id',
            resources: [{ url: 'data:text/html,hello' }, { url: 'mailto:marketing@openinfra.dev' }],
          },
        ],
      },
    ],
  };
  const card = prepareMarketing(draft).sections[0].cards[0];
  assert.equal(card.image, '');
  assert.equal(card.action.url, '');
  assert.equal(card.videoId, '');
  assert.equal(card.resources[0].url, '');
  assert.equal(card.resources[1].url, 'mailto:marketing@openinfra.dev');
});

test('marketing saves accept reordered public records but reject incomplete or duplicated identities', () => {
  const reordered = structuredClone(content);
  reordered.sections.reverse();
  assert.equal(validateMarketing(reordered), reordered);
  for (const mutate of [
    (data) => data.sections.push(structuredClone(data.sections[0])),
    (data) => data.sections[1].cards.push({ id: 'new-card', title: '' }),
    (data) => (data.sections[1].cards[0].action.url = 'javascript:alert(1)'),
    (data) => (data.sections[1].cards[0].videoId = 'invalid'),
  ]) {
    const draft = structuredClone(content);
    mutate(draft);
    assert.throws(() => validateMarketing(draft));
  }
});
