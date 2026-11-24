import { independentFetch } from '../network/upstream.mjs';
import { resolveEditorialPreview } from './editorial-preview.mjs';
import {
  assessPreviewPull,
  previewRepository,
  prPreviewWorkflow,
  prPreviewWorkflowUrl,
  pullPreviewBranch,
  validPullNumber,
  validRevision,
} from './pr-preview-policy.mjs';
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Caller verifies Tina membership and same-origin POST before entering this handler. */
export async function handlePullPreview(request, env, fetcher = fetch) {
  const url = new URL(request.url);
  const number = url.searchParams.get('pr');
  if (!validPullNumber(number))
    return json({ error: 'Enter a pull request number, such as 57.' }, 400);
  const reader = env.EDITORIAL_GITHUB_TOKEN;
  const writer = env.EDITORIAL_PREVIEW_DISPATCH_TOKEN || env.SOFTWARE_REFRESH_GITHUB_TOKEN;
  if (!reader) return json({ error: 'The preview reader connection is not configured.' }, 503);
  const github = async (path, token = reader, body) => {
    const response = await independentFetch(
      `https://api.github.com/repos/${previewRepository}${path}`,
      {
        method: body ? 'POST' : 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'OpenStack-PR-preview',
        },
        signal: AbortSignal.timeout(15000),
        cache: 'no-store',
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
      fetcher,
    );
    if (!response.ok) throw Error('GitHub request failed');
    return response.status === 204 ? null : response.json();
  };
  try {
    const [pull, files, main] = await Promise.all([
      github(`/pulls/${number}`),
      github(`/pulls/${number}/files?per_page=100`),
      github('/commits/main'),
    ]);
    const reason = assessPreviewPull(pull, files);
    const info = {
      number: Number(number),
      title: pull.title,
      source: pull.head?.label,
      pullUrl: `https://github.com/${previewRepository}/pull/${number}`,
      files: Array.isArray(files) ? files.map((file) => file.filename) : [],
      head: pull.head?.sha,
      base: main.sha,
      configured: Boolean(writer),
      workflowUrl: prPreviewWorkflowUrl,
    };
    if (reason)
      return json({ ...info, state: 'blocked', reason }, request.method === 'POST' ? 409 : 200);
    if (!validRevision(main.sha)) throw Error('Main revision unavailable');
    const branch = pullPreviewBranch(number, pull.head.sha, main.sha);
    const preview = await resolveEditorialPreview(branch, fetcher, reader);
    const state = preview.state === 'missing' ? 'not_requested' : preview.state;
    const result = { ...info, ...preview, state, branch };
    if (request.method === 'GET') return json(result);
    if (!writer) return json({ error: 'The preview workflow connection is not configured.' }, 503);
    if (url.searchParams.get('head') !== pull.head.sha || url.searchParams.get('base') !== main.sha)
      return json(
        { error: 'The PR or main branch changed. Inspect the PR again before building.' },
        409,
      );
    if (preview.state === 'ready') return json(result);
    if (!['missing', 'pending', 'failed'].includes(preview.state))
      return json(
        {
          error: 'Cannot check the preview state. Try again after checking the GitHub connection.',
        },
        503,
      );
    const runs = await github(
      `/actions/workflows/${prPreviewWorkflow}/runs?branch=main&per_page=100`,
      writer,
    );
    if (!Array.isArray(runs.workflow_runs)) throw Error('Invalid run response');
    if (runs.workflow_runs.some((run) => run.status !== 'completed'))
      return json(
        { error: 'A PR preview is being prepared. Wait for it to finish and check status.' },
        409,
      );
    await github(`/actions/workflows/${prPreviewWorkflow}/dispatches`, writer, {
      ref: 'main',
      inputs: { pr: String(number), head: pull.head.sha, base: main.sha },
    });
    return json({ ...result, accepted: true }, 202);
  } catch {
    return json(
      {
        error:
          'GitHub could not verify the PR or confirm the request. Check the reader token (Contents, Commit statuses and Pull requests: Read), and build history before retrying.',
      },
      503,
    );
  }
}
