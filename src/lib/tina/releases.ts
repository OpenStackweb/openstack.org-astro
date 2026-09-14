import { requestWithMetadata } from '@tinacms/astro';
import { releaseAnnouncement } from '../../../tina/schema/releases';
import { document } from './site';
import { releaseEditorContent } from '../server/release-announcements.mjs';

const records = import.meta.glob('../content/releases/*.json', { eager: true, import: 'default' });
export function loadReleaseAnnouncement(filename: string, allowUnpublished = false) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(filename)) throw new Error('Invalid release document');
  const content = releaseEditorContent(filename, records[`../content/releases/${filename}.json`], allowUnpublished);
  const entry = document(releaseAnnouncement, filename, content);
  return requestWithMetadata({
    query: `query ReleaseAnnouncementEditor { ${entry.selection} }`, variables: {},
    data: { releaseAnnouncement: entry.data },
  });
}
