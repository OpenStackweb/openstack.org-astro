import { requestWithMetadata } from '@tinacms/astro';
import { releaseAnnouncement } from '../../../tina/schema/releases';
import { document } from './site';

const records = import.meta.glob('../content/releases/*.json', { eager: true, import: 'default' });
export function loadReleaseAnnouncement(filename: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(filename)) throw new Error('Invalid release document');
  const content = records[`../content/releases/${filename}.json`];
  if (!content) throw new Error('Release announcement is not published in this build.');
  const entry = document(releaseAnnouncement, filename, content);
  return requestWithMetadata({
    query: `query ReleaseAnnouncementEditor { ${entry.selection} }`, variables: {},
    data: { releaseAnnouncement: entry.data },
  });
}
