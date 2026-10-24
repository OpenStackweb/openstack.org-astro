import test from 'node:test';
import assert from 'node:assert/strict';
import content from '../../src/lib/content/use-cases.json' with { type: 'json' };
import { validateUseCases } from '../../tina/use-cases-validation.mjs';

test('Use Cases editorial save preserves catalogue mode identities and permits labels and order', () => {
  const draft = structuredClone(content);
  draft.views.reverse();
  draft.views[0].label = 'Large deployments';
  draft.title = 'OpenStack user stories';
  assert.equal(validateUseCases(draft), draft);
  for (const change of [
    (v) => v.views.pop(),
    (v) => (v.views[1].value = v.views[0].value),
    (v) => (v.views[0].value = 'unknown'),
    (v) => (v.views[0].label = ''),
  ]) {
    const invalid = structuredClone(content);
    change(invalid);
    assert.throws(() => validateUseCases(invalid), /five browse modes/);
  }
});

test('Use Cases rejects invalid video and unsafe destinations before editorial save', () => {
  for (const [field, value] of [
    ['youtubeId', 'https://youtube.com/watch?v=123'],
    ['heroImage', 'javascript:alert(1)'],
    ['surveyUrl', 'javascript:alert(1)'],
    ['socialImage', 'javascript:alert(1)'],
    ['resultLabel', ' '],
  ]) {
    assert.throws(() => validateUseCases({ ...content, [field]: value }));
  }
  assert.equal(
    validateUseCases({ ...content, heroImage: '/assets/reviewed-image.jpg' }).heroImage,
    '/assets/reviewed-image.jpg',
  );
});

test('removing the hero video survives save validation and server preparation', async () => {
  const { prepareUseCases } = await import('../../src/lib/server/use-cases.mjs');
  for (const youtubeId of ['', null, undefined]) {
    const draft = { ...content, youtubeId };
    assert.equal(validateUseCases(draft), draft);
    assert.equal(prepareUseCases(draft).youtubeId, youtubeId);
  }
});
