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

test('nested text clears and false values survive remount; declared field defaults still initialize', () => {
  const form = createForm({ onSubmit() {}, initialValues: { card: { title: 'Saved title', enabled: true } } });
  const tree = visible => React.createElement(Form, { form, onSubmit() {} }, () => visible ? React.createElement(React.Fragment, null,
    React.createElement(Field, { name: 'card.title' }, () => null),
    React.createElement(Field, { name: 'card.enabled' }, () => null),
    React.createElement(Field, { name: 'newField', initialValue: 'Default text' }, () => null)
  ) : null);
  let root;
  act(() => { root = create(tree(true)); });
  assert.equal(form.getState().values.newField, 'Default text');
  act(() => { form.change('card.title', undefined); form.change('card.enabled', false); });
  act(() => { root.update(tree(false)); });
  act(() => { root.update(tree(true)); });
  assert.equal(form.getState().values.card.title, undefined);
  assert.equal(form.getState().values.card.enabled, false);
  act(() => { form.reset(); });
  assert.equal(form.getState().values.card.title, 'Saved title');
  assert.equal(form.getState().values.card.enabled, true);
  act(() => { root.unmount(); });
});
