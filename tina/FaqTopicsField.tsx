import React from 'react';
import { fieldHelpStyle, listFieldStyle, listItemStyle } from './field-layout';
import { FaqQuestionsField, validateFaqQuestions } from './FaqQuestionsField';

type Topic = { id: string; title: string; questions?: { question: string; answer: string }[] };
type Props = {
  input: { value?: unknown; onChange: (value: any) => void };
  meta?: { error?: string };
};

export function validateFaqTopics(value: unknown) {
  if (value == null) return;
  if (!Array.isArray(value) || value.length > 50) return 'Use at most 50 FAQ topics.';
  const ids = new Set();
  for (const topic of value) {
    if (
      !topic ||
      typeof topic.id !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id) ||
      ids.has(topic.id)
    )
      return 'Each topic needs a unique anchor using lowercase letters, numbers and hyphens.';
    ids.add(topic.id);
    if (typeof topic.title !== 'string' || !topic.title.trim() || topic.title.length > 250)
      return 'Each topic needs a title of at most 250 characters.';
    const error = validateFaqQuestions(topic.questions);
    if (error) return error;
  }
}

export function FaqTopicsField({ input, meta }: Props) {
  const topics: Topic[] = Array.isArray(input.value) ? input.value : [];
  const update = (index: number, changes: Partial<Topic>) =>
    input.onChange(topics.map((topic, i) => (i === index ? { ...topic, ...changes } : topic)));
  const move = (index: number, offset: number) => {
    const next = [...topics];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    input.onChange(next);
  };
  return (
    <fieldset className="mb-6" style={listFieldStyle}>
      <legend className="font-semibold mb-2">FAQ topics</legend>
      <p className="text-sm text-gray-500 mb-3" style={fieldHelpStyle}>
        Topics and their questions appear in this order. Keep existing anchors to preserve incoming
        links.
      </p>
      {meta?.error && (
        <p role="alert" className="text-sm text-red-600 mb-3">
          {meta.error}
        </p>
      )}
      {topics.map((topic, index) => (
        <fieldset key={index} className="border rounded p-3 mb-4" style={listItemStyle}>
          <legend className="text-sm px-1">Topic {index + 1}</legend>
          <details>
            <summary className="cursor-pointer font-semibold text-sm mb-3">
              {topic.title || 'New topic'}
            </summary>
            <label className="block text-sm mb-2">
              Topic {index + 1} anchor
              <input
                className="block w-full border rounded p-2"
                value={topic.id || ''}
                onChange={(event) => update(index, { id: event.target.value })}
              />
            </label>
            <label className="block text-sm mb-3">
              Topic {index + 1} title
              <input
                className="block w-full border rounded p-2"
                value={topic.title || ''}
                onChange={(event) => update(index, { title: event.target.value })}
              />
            </label>
            <FaqQuestionsField
              input={{
                value: topic.questions,
                onChange: (questions) => update(index, { questions }),
              }}
              meta={{ error: validateFaqQuestions(topic.questions) }}
            />
          </details>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              disabled={index === 0}
              aria-label={`Move topic ${index + 1} up`}
              className="border rounded px-2 py-1 disabled:opacity-40"
              onClick={() => move(index, -1)}
            >
              Up
            </button>
            <button
              type="button"
              disabled={index === topics.length - 1}
              aria-label={`Move topic ${index + 1} down`}
              className="border rounded px-2 py-1 disabled:opacity-40"
              onClick={() => move(index, 1)}
            >
              Down
            </button>
            <button
              type="button"
              aria-label={`Remove topic ${index + 1} and its questions`}
              className="border rounded px-2 py-1"
              onClick={() => input.onChange(topics.filter((_, i) => i !== index))}
            >
              Remove topic
            </button>
          </div>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={topics.length >= 50}
        className="border rounded px-3 py-2 text-sm"
        onClick={() => input.onChange([...topics, { id: '', title: '', questions: [] }])}
      >
        Add topic
      </button>
    </fieldset>
  );
}
