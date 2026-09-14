import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { Form, Field } from 'react-final-form';
import { createForm } from 'final-form';

test('switching editor sections preserves unsaved list changes and Reset still restores saved content', () => {
  const original = [{ title: 'Saved card' }];
  const form = createForm({ onSubmit() {}, initialValues: { cards: original } });
  const tree = visible => React.createElement(Form, { form, onSubmit() {} }, () =>
    visible ? React.createElement(Field, { name: 'cards' }, () => null) : null);
  let root;
  act(() => { root = create(tree(true)); });
  const draft = [...original, { title: 'Unsaved card' }];
  act(() => { form.change('cards', draft); });
  act(() => { root.update(tree(false)); });
  act(() => { root.update(tree(true)); });
  assert.deepEqual(form.getState().values.cards, draft);
  act(() => { form.change('cards', []); });
  act(() => { root.update(tree(false)); });
  act(() => { root.update(tree(true)); });
  assert.deepEqual(form.getState().values.cards, []);
  act(() => { form.reset(); });
  assert.deepEqual(form.getState().values.cards, original);
  act(() => { root.unmount(); });
});
