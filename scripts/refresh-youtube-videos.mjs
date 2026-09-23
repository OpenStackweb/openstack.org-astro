// Operator-only read of public YouTube data. Never imported by a build/browser.
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fetchVideoFeed } from '../src/lib/videos/youtube.mjs';
import { selectVideos } from '../src/lib/videos/selection.mjs';
if (existsSync('.env')) process.loadEnvFile('.env');
const output = process.argv[2];
if (!output || resolve(output).startsWith(process.cwd() + '/'))
  throw new Error('Provide an output JSON path outside the repository');
const content = JSON.parse(await readFile('src/lib/content/videos.json', 'utf8'));
const feed = await fetchVideoFeed(process.env.YOUTUBE_API_KEY, content);
await writeFile(output, JSON.stringify(feed, null, 2) + '\n', { mode: 0o600 });
const selected = selectVideos(feed.videos, content);
console.log(
  JSON.stringify(
    {
      fetchedAt: feed.fetchedAt,
      requests: feed.audit.requests,
      uploads: feed.audit.uploads,
      candidates: feed.videos.length,
      selected: Object.fromEntries(
        Object.entries(selected).map(([key, rows]) => [
          key,
          rows.map(({ id, title }) => ({ id, title })),
        ]),
      ),
      websiteChanged: false,
      retention: 'Delete this temporary API export within 28 days.',
    },
    null,
    2,
  ),
);
