import catalogue from '../user-stories/catalog.json';
import preserved from '../content/home-story-records.json';
// Read-only service snapshots. CMS editors select records and presentation;
// they do not change the source story or organization data here.
export const storyRecords: Record<
  string,
  { name: string; description: string; link: string; image: string }
> = Object.fromEntries([
  ...catalogue.map((row) => [
    String(row.id),
    { name: row.name, description: row.description, link: row.link, image: row.image },
  ]),
  ...Object.entries(preserved).map(([id, row]) => [
    id,
    { name: row.name, description: row.description, link: row.link, image: row.image.url },
  ]),
]);
