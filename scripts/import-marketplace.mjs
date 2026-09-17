// Explicit read-only refresh. Never runs during a build or writes service-owned records.
import { writeFile, rename } from 'node:fs/promises';
import { categories, fetchCategory } from './marketplace-api.mjs';
const source = 'https://oifapi.openinfra.dev';
const result = [];
for (const category of categories) {
  result.push(await fetchCategory(source, category));
  console.log(`${category.slug}: ${result.at(-1).records.length}`);
}
const path = 'src/lib/marketplace/catalog.json';
await writeFile(
  path + '.tmp',
  JSON.stringify(
    {
      source,
      fetchedAt: new Date().toISOString(),
      scope:
        'Public browsing snapshot; production data and administrative parity not certified. No review authors or private credentials imported.',
      categories: result,
    },
    null,
    2,
  ) + '\n',
);
await rename(path + '.tmp', path);
