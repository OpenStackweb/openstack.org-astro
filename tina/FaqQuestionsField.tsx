import React from 'react';

type Question = { question: string; answer: string };
type Props = {
  input: { value?: unknown; onChange: (value: any) => void };
  meta?: { error?: string };
};

export function validateFaqQuestions(value: unknown) {
  if (value == null) return;
  if (!Array.isArray(value) || value.length > 200) return 'Use at most 200 questions per topic.';
  for (const item of value) {
    if (!item || typeof item.question !== 'string' || !item.question.trim() || item.question.length > 2000)
      return 'Each question needs text of at most 2000 characters.';
    if (typeof item.answer !== 'string' || !item.answer.trim() || item.answer.length > 500000)
      return 'Each answer needs text of at most 500000 characters.';
  }
}

// Edit inline so moving/removing/resetting an item never leaves Tina on a
// nested item path that no longer exists. Input is the sole source of state.
export function FaqQuestionsField({ input, meta }: Props) {
  const questions: Question[] = Array.isArray(input.value) ? input.value : [];
  const update = (index: number, field: keyof Question, value: string) =>
    input.onChange(questions.map((item, i) => i === index ? { ...item, [field]: value } : item));
  const move = (index: number, offset: number) => {
    const next = [...questions];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    input.onChange(next);
  };
  return <fieldset className="mb-6">
    <legend className="font-semibold mb-2">Questions</legend>
    <p className="text-sm text-gray-500 mb-3">Questions appear in this order. Use Up and Down to reorder them.</p>
    {meta?.error && <p role="alert" className="text-sm text-red-600 mb-3">{meta.error}</p>}
    {questions.map((item, index) => <fieldset key={index} className="border rounded p-3 mb-3">
      <legend className="text-sm px-1">Question {index + 1}</legend>
      <details>
        <summary className="cursor-pointer text-sm mb-3">{item.question || 'New question'}</summary>
        <label className="block text-sm mb-2">Question {index + 1} text
          <input className="block w-full border rounded p-2" value={item.question || ''}
            onChange={event => update(index, 'question', event.target.value)} />
        </label>
        <label className="block text-sm mb-3">Question {index + 1} answer (HTML or Markdown)
          <textarea className="block w-full border rounded p-2" rows={8} value={item.answer || ''}
            onChange={event => update(index, 'answer', event.target.value)} />
        </label>
      </details>
      <div className="flex flex-wrap gap-2 text-sm">
        <button type="button" className="border rounded px-2 py-1 disabled:opacity-40" disabled={index === 0}
          aria-label={`Move question ${index + 1} up`} onClick={() => move(index, -1)}>Up</button>
        <button type="button" className="border rounded px-2 py-1 disabled:opacity-40" disabled={index === questions.length - 1}
          aria-label={`Move question ${index + 1} down`} onClick={() => move(index, 1)}>Down</button>
        <button type="button" className="border rounded px-2 py-1" aria-label={`Remove question ${index + 1}`}
          onClick={() => input.onChange(questions.filter((_, i) => i !== index))}>Remove</button>
      </div>
    </fieldset>)}
    <button type="button" className="border rounded px-3 py-2 text-sm" disabled={questions.length >= 200}
      onClick={() => input.onChange([...questions, { question: '', answer: '' }])}>Add question</button>
  </fieldset>;
}
