import { requestWithMetadata } from '@tinacms/astro';
import { editorial } from '../../../tina/schema/editorial';
import pages from '../../../tina/editorial-pages.json';
import { document } from './site';
import { archiveEvent } from '../../../tina/schema/archive-events';
import events from '../server/archive-event-content.mjs';

const records = import.meta.glob('../content/pages/*.json', { eager: true, import: 'default' });
export const editablePageFor = (path: string) => pages.find((page) => page.path === path);
export async function loadEditorial(filename: string, sharedFirst = false) {
  if (!pages.some((page) => page.filename === filename)) throw new Error('Unknown editorial document');
  const content = records[`../content/pages/${filename}.json`];
  const entry = document(editorial, filename, content);
  const eventId = (content as { archiveEvent?: string }).archiveEvent;
  const shared = eventId ? events.events.find(event => event.id === eventId) : undefined;
  if (eventId && !shared) throw new Error('Unknown shared event');
  const eventEntry = shared ? document(archiveEvent, eventId!, {
    eventId: shared.id, title: shared.title, introduction: shared.introduction,
    resources: shared.resources, navigation: shared.navigation,
  }) : null;
  return requestWithMetadata({
    query: `query EditorialEditor { ${sharedFirst && eventEntry ? eventEntry.selection + ' ' + entry.selection : entry.selection + ' ' + (eventEntry?.selection || '')} }`, variables: {},
    data: sharedFirst && eventEntry
      ? { archiveEvent: eventEntry.data, editorial: entry.data }
      : { editorial: entry.data, ...(eventEntry ? { archiveEvent: eventEntry.data } : {}) },
  });
}
