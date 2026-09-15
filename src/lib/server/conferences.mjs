import { prepareEditorialPage, renderEditorialBody } from './editorial.mjs';
import { withArchiveEvent } from './archive-events.mjs';
import keys from '../content/conference-keys.json' with { type: 'json' };

// Only reviewed route keys may become landing pages, even in CMS drafts.
export function prepareConference(key, content, lookup) {
  if (!keys.includes(key)) throw new Error('Unknown conference.');
  const event = content.events.find((item) => item.id === key);
  if (!event?.landing) throw new Error('Missing conference content.');
  const landing = event.landing;
  const path = `/summit/${key}/`;
  const page = withArchiveEvent(
    prepareEditorialPage({
      title: event.title,
      description: `Archived ${event.title} information, news updates, venue details and historical event resources.`,
      path,
      body: landing.overview || '',
      archiveEvent: key,
      archiveNotice:
        'Archived event content. Dates, registration information and policies below apply to this historical Summit.',
    }),
    content
  );
  if (!Array.isArray(landing.updates) || landing.updates.length > 100)
    throw new Error('Invalid conference updates.');
  const updates = landing.updates.map((item) => {
    if (typeof item.dateLabel !== 'string' || item.dateLabel.length > 100)
      throw new Error('Invalid update date.');
    const article = prepareEditorialPage({ title: item.title, path, body: item.body || '' });
    if (item.page) {
      if (typeof item.page !== 'string' || !item.page.startsWith(path))
        throw new Error('Conference update must reference its own event.');
      const referenced = lookup(item.page);
      if (!referenced) throw new Error('Missing referenced conference article.');
      article.html = referenced.html;
    }
    return {
      title: article.title,
      dateLabel: item.dateLabel,
      html: article.html,
      path: item.page || path,
    };
  });
  if (typeof landing.newsTitle !== 'string' || landing.newsTitle.length > 250)
    throw new Error('Invalid news heading.');
  return {
    ...page,
    conference: {
      newsTitle: landing.newsTitle,
      updates,
      sidebarHtml: renderEditorialBody(landing.sidebar || '', path),
      reminderHtml: renderEditorialBody(landing.reminder || '', path),
    },
  };
}
