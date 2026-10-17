import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { editorialPreviewConfig } from './lib/editorial-preview-config.mjs';
import { verifySiteBuild } from './lib/site-build-profile.mjs';

const { config: source } = await verifySiteBuild('review');
const admin = await readFile('dist/client/admin/index.html', 'utf8');
assert.ok(!/localhost:4001|127\.0\.0\.1:4001/.test(admin), 'Rebuild the hosted editor before preparing a preview');
const config = editorialPreviewConfig(source);
// Same directory preserves Astro's generated relative entry/asset paths.
await writeFile('dist/server/wrangler.editorial.json', JSON.stringify(config, null, 2) + '\n');
console.log('Prepared dist/server/wrangler.editorial.json; no upload performed.');
console.log('Both public URL types remain disabled. Access and exact-branch build verification are required before preview publication.');
