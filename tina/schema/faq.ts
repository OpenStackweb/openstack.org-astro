import type { TinaField } from 'tinacms';
export const faqField: TinaField = {
  type: 'object', name: 'faq', label: 'Archived questions and answers',
  description: 'Published archive content only. Hidden questions from the historical database have not been imported. Contact opens information, not a submission form.',
  fields: [
    { type: 'string', name: 'emptyMessage', label: 'Message when there are no topics', required: true },
    { type: 'string', name: 'contactTitle', label: 'Contact button and dialog heading', required: true },
    { type: 'string', name: 'contactBody', label: 'Contact information (HTML or Markdown)', required: true, ui: { component: 'textarea' } },
    { type: 'object', name: 'categories', label: 'Topics', list: true,
      ui: { itemProps: item => ({ label: item.title || 'New topic' }) },
      fields: [
        { type: 'string', name: 'id', label: 'Topic anchor', required: true, description: 'Unique lowercase letters, numbers and hyphens. Keep existing anchors to preserve incoming links.' },
        { type: 'string', name: 'title', label: 'Topic title', required: true },
        { type: 'object', name: 'questions', label: 'Questions', list: true,
          ui: { itemProps: item => ({ label: item.question || 'New question' }) },
          fields: [
            { type: 'string', name: 'question', label: 'Question', required: true },
            { type: 'string', name: 'answer', label: 'Answer (HTML or Markdown)', required: true, ui: { component: 'textarea' } },
          ] },
      ] },
  ],
};
