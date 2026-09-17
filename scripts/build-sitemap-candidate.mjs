import { readFile, writeFile } from 'node:fs/promises';
import { sitemapCandidate } from './lib/sitemap-candidate.mjs';

// Fixed offline destination: this command cannot publish or enable indexing.
const report = JSON.parse(await readFile(new URL('../docs/sitemap-review.json', import.meta.url), 'utf8'));
const destination = new URL('../docs/sitemap-candidate.xml', import.meta.url);
await writeFile(destination, sitemapCandidate(report));
console.log(`Wrote ${report.candidateCount} candidate URLs to docs/sitemap-candidate.xml (offline review only).`);
