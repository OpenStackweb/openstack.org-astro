import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { fetchSoftwareCatalog } from './software-api.mjs';
import { softwareCandidateFiles } from './lib/software-candidate.mjs';

// Explicit operator command only. Never imported by the website build or browser.
if (existsSync('.env')) process.loadEnvFile('.env');
try {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--export') || args.length > 1)
    throw Error('Usage: node scripts/check-software-api.mjs [--export]');
  const result = await fetchSoftwareCatalog(process.env, fetch, {
    includeSamples: true,
    includeHistory: true,
  });
  let candidateDirectory;
  if (args.includes('--export')) {
    await mkdir('.software-preview', { recursive: true });
    candidateDirectory = await mkdtemp('.software-preview/candidate-');
    const files = [];
    for (const [name, value] of Object.entries(softwareCandidateFiles(result))) {
      const body = JSON.stringify(value, null, 2) + '\n';
      await writeFile(`${candidateDirectory}/${name}`, body, { flag: 'wx' });
      files.push({ name, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex') });
    }
    // Written last: a partial directory is never a complete review candidate.
    await writeFile(`${candidateDirectory}/manifest.json`, JSON.stringify({
      generatedAt: new Date().toISOString(), source: result.source, complete: true, files,
    }, null, 2) + '\n', { flag: 'wx' });
  }
  const count = nodes => nodes.reduce((sum, node) => sum + node.components.length + count(node.subcategories), 0);
  console.log(JSON.stringify({
    source: result.source,
    release: result.release.name,
    components: count(result.catalog),
    publicationAudit: result.audit,
    history: result.history.map(item => ({ release: item.release.name, components: count(item.catalog), publicationAudit: item.audit })),
    candidateDirectory,
    websiteChanged: false,
  }, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
