export function validateFaqSubmission(faq) {
  if (!faq) return;
  const text = (value, label, max) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      throw new Error(`${label} is required and must be at most ${max} characters.`);
  };
  const categories = faq.categories ?? [];
  if (!Array.isArray(categories) || categories.length > 50) throw new Error('Use at most 50 FAQ topics.');
  const ids = new Set();
  for (const category of categories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id) || ids.has(category.id))
      throw new Error('Each FAQ topic needs a unique lowercase anchor, using letters, numbers and hyphens.');
    ids.add(category.id);
    text(category.title, 'Topic title', 250);
    const questions = category.questions ?? [];
    if (!Array.isArray(questions) || questions.length > 200) throw new Error('Use at most 200 questions per topic.');
    for (const item of questions) {
      text(item.question, 'Question', 2000);
      text(item.answer, 'Answer', 500000);
    }
  }
  text(faq.emptyMessage, 'Empty message', 2000);
  text(faq.contactTitle, 'Contact title', 250);
  text(faq.contactBody, 'Contact information', 500000);
}
