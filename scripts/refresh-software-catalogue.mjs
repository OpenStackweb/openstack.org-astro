// Explicit workflow only: normal builds never import or execute this file.
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fetchSoftwareCatalog } from './software-api.mjs';
import { prepareSoftwareRefresh, snapshotFiles } from './lib/software-refresh.mjs';

const repo = 'OpenStackweb/openstack.org-astro';
const workflow = 'editorial-preview.yml';
const branchPrefix = 'software-refresh/';
const token = process.env.GH_TOKEN;
async function github(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    redirect: 'error',
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'OpenStack-catalogue-refresh',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const note = (text) => appendFile(process.env.GITHUB_STEP_SUMMARY, text + '\n');
try {
  if (
    process.env.GITHUB_REPOSITORY !== repo ||
    process.env.GITHUB_REF !== 'refs/heads/main' ||
    !token ||
    !/^\d+$/.test(process.env.GITHUB_RUN_ID || '')
  )
    throw new Error('Refresh must run from the trusted main workflow.');
  // Do not silently replace a candidate that staff are already reviewing.
  const pending = await github('/pulls?state=open&base=main&per_page=100');
  if (pending.length === 100)
    throw new Error('Too many open pull requests to safely check for an existing refresh.');
  const existing = pending.find(
    (pr) => pr.head.repo?.full_name === repo && pr.head.ref.startsWith(branchPrefix),
  );
  if (existing) {
    await note(
      `A catalogue update is already awaiting review: [Pull request #${existing.number}](${existing.html_url}). Merge or close it before requesting another refresh.`,
    );
  } else {
    const previous = Object.fromEntries(
      await Promise.all(
        snapshotFiles.map(async (name) => [
          name,
          JSON.parse(await readFile(`src/lib/software/${name}`, 'utf8')),
        ]),
      ),
    );
    const result = await fetchSoftwareCatalog(process.env, fetch, {
      includeSamples: true,
      includeHistory: true,
    });
    const candidate = prepareSoftwareRefresh(result, previous);
    if (!candidate.changed.length) {
      await note(
        'Catalogue checked successfully. No data changes; no pull request or deployment created.',
      );
    } else {
      // A concurrent publication must not base the candidate on a stale main checkout.
      const current = await github('/git/ref/heads/main');
      if (current.object.sha !== git('rev-parse', 'HEAD'))
        throw new Error('Main changed during the fetch. Run refresh again.');
      for (const name of snapshotFiles)
        await writeFile(
          `src/lib/software/${name}`,
          JSON.stringify(candidate.files[name], null, 2) + '\n',
        );
      await writeFile(
        'src/lib/software/catalogue-refresh.json',
        JSON.stringify(candidate.metadata, null, 2) + '\n',
      );
      const branch = `${branchPrefix}${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
      git('checkout', '-b', branch);
      git('config', 'user.name', 'OpenStack catalogue refresh');
      git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com');
      git(
        'add',
        ...snapshotFiles.map((name) => `src/lib/software/${name}`),
        'src/lib/software/catalogue-refresh.json',
      );
      git('commit', '-m', 'Refresh Software API catalogue snapshot');
      git('push', 'origin', branch);
      const revision = git('rev-parse', 'HEAD');
      const preview = `https://astro.openstack.org/review/branch/?branch=${encodeURIComponent(branch)}`;
      const pr = await github('/pulls', 'POST', {
        title: 'Review Software catalogue refresh',
        head: branch,
        base: 'main',
        body: `Fetched public catalogue data from the configured Software API. No service records or editorial content were modified.\n\nReview the data diff and [protected preview](${preview}) before merging. Merging publishes this snapshot through the normal site deployment.\n\n\`\`\`json\n${JSON.stringify(candidate.summary, null, 2)}\n\`\`\`\n\n[Refresh run](https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID})`,
      });
      await note(
        `[Review pull request #${pr.number}](${pr.html_url}) · [Protected preview](${preview})`,
      );
      // GITHUB_TOKEN pushes do not trigger other workflows; explicit dispatch does.
      await github(`/actions/workflows/${workflow}/dispatches`, 'POST', {
        ref: 'main',
        inputs: { branch, revision },
      });
    }
  }
} catch (error) {
  // Never print service response bodies or request headers.
  console.error(
    error.message?.startsWith('Missing Software API settings:')
      ? error.message
      : 'Catalogue refresh failed. No change was merged or deployed. Check configuration and any candidate PR before retrying.',
  );
  process.exitCode = 1;
}
