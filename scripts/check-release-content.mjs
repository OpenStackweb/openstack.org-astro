// Build-time protection for both Git edits and CMS-created announcements.
import { readFile, readdir } from 'node:fs/promises';
import { validateReleaseRegistry } from './lib/release-registry.mjs';
const directory = new URL('../src/lib/content/releases/', import.meta.url);
const entries = await Promise.all((await readdir(directory)).filter(name => name.endsWith('.json'))
  .map(async filename => [filename, JSON.parse(await readFile(new URL(filename, directory), 'utf8'))]));
const releases = validateReleaseRegistry(entries);
console.log(`Release content: ${releases.length} valid documents with unique routes and stable filenames.`);
