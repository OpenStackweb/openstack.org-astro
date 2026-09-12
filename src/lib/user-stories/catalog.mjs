const views = ['date', 'name', 'location', 'industry', 'scale'];
export function storySelection(hash = '') {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('search'))
    return { view: 'date', search: params.get('search'), tag: '', section: '' };
  if (params.get('tag')) return { view: 'date', search: '', tag: params.get('tag'), section: '' };
  const view = views.find((name) => params.has(name)) || 'date';
  return { view, search: '', tag: '', section: params.get(view) || '' };
}
export const storyGroupId = (text) => text.replace(/\s\/\s|\s/g, '-').toLowerCase();
export function storyGroups(stories, selection) {
  const { view, search = '', tag = '' } = selection;
  const query = search.trim().toLowerCase();
  const text = (html) => html.replace(/<[^>]*>/g, ' ');
  const selected = stories.filter(
    (story) =>
      (!query || `${story.name} ${text(story.description)}`.toLowerCase().includes(query)) &&
      (!tag || story.tags.includes(tag)) &&
      (view !== 'scale' || story.largeScale)
  );
  // Match legacy code-unit ordering, independent of server/browser locale.
  const compare = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  const grouped = ['location', 'industry'].includes(view);
  const ordered = [...selected].sort((a, b) =>
    view === 'date' || grouped ? compare(b.date, a.date) : compare(a.name, b.name)
  );
  if (!['location', 'industry'].includes(view)) return [{ title: '', id: '', stories: ordered }];
  const groups = new Map();
  for (const story of ordered) {
    const title = story[view] || 'Unspecified';
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(story);
  }
  return [...groups]
    .sort(([a], [b]) => compare(a, b))
    .map(([title, stories]) => ({ title, id: storyGroupId(title), stories }));
}
