import events from './archive-event-content.mjs';
import { prepareEditorialPage, renderEditorialBody } from './editorial.mjs';

export function withArchiveEvent(page, content = events) {
  if (!page.archiveEvent) return page;
  if (!Array.isArray(content?.events) || content.events.length > 100)
    throw new Error('Invalid archive events.');
  const matches = content.events.filter((event) => event.id === page.archiveEvent);
  if (matches.length !== 1) throw new Error('Archive event is missing or duplicated.');
  const event = matches[0];
  const validated = prepareEditorialPage({
    title: event.title,
    path: page.path,
    body: event.introduction ?? '',
    sectionNavigation: event.navigation,
  });
  return {
    ...page,
    sectionNavigation: validated.sectionNavigation,
    archiveIntroductionHtml: validated.html,
    archiveResourcesHtml: renderEditorialBody(event.resources ?? '', page.path),
  };
}
