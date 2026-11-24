import { independentFetch } from '../network/upstream.mjs';
import { resolveEditorialPreview, validEditorialBranch } from './editorial-preview.mjs';

const repository = 'OpenStackweb/openstack.org-astro';
export const previewWorkflowUrl = `https://github.com/${repository}/actions/workflows/editorial-preview.yml`;
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Only an explicit authenticated editor action can dispatch the fixed preview workflow. */
export async function handleEditorialPreview(request, env, authorize, fetcher = fetch) {
  const url = new URL(request.url);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  if (request.method === 'POST' && request.headers.get('origin') !== url.origin)
    return json({ error: 'Request a preview from this editor.' }, 403);
  const token = request.headers.get('authorization');
  if (!token || !env.PUBLIC_TINA_CLIENT_ID) return json({ error: 'Sign into Tina first.' }, 401);
  try {
    const user = await authorize({ clientID: env.PUBLIC_TINA_CLIENT_ID, token });
    if (user?.verified !== true || user.enabled !== true)
      return json({ error: 'Enabled editor membership is required.' }, 403);
  } catch {
    return json({ error: 'Editor authentication is unavailable. Try again.' }, 503);
  }
  const branch = url.searchParams.get('branch') || '';
  if (!validEditorialBranch(branch)) return json({ error: 'Choose a valid branch in Tina.' }, 400);
  const access = env.EDITORIAL_PREVIEW_DISPATCH_TOKEN || env.SOFTWARE_REFRESH_GITHUB_TOKEN;
  const status = await resolveEditorialPreview(
    branch,
    fetcher,
    env.EDITORIAL_GITHUB_TOKEN || access,
  );
  const base = { ...status, branch, configured: Boolean(access), workflowUrl: previewWorkflowUrl };
  if (request.method === 'GET') {
    let branches = [];
    const reader = env.EDITORIAL_GITHUB_TOKEN || access;
    if (reader) {
      try {
        const response = await independentFetch(
          `https://api.github.com/repos/${repository}/branches?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${reader}`,
              Accept: 'application/vnd.github+json',
              'User-Agent': 'OpenStack-editorial-preview-panel',
            },
            redirect: 'manual',
            signal: AbortSignal.timeout(10000),
            cache: 'no-store',
          },
          fetcher,
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data))
            branches = data
              .map((item) => item.name)
              .filter((name) => validEditorialBranch(name) && name !== 'main');
        }
      } catch {
        /* Status can still be shown if branch listing is temporarily unavailable. */
      }
    }
    return json({ ...base, branches });
  }
  if (branch === 'main')
    return json({ error: 'Choose an editorial branch before building a preview.' }, 400);
  if (!access)
    return json({ error: 'Preview builds are not connected yet. Contact a site maintainer.' }, 503);
  if (status.state === 'ready') return json(base);
  if (!['pending', 'failed'].includes(status.state) || !status.sha)
    return json(
      { error: 'Cannot verify the current branch revision. Check status and try again.' },
      409,
    );
  const github = async (path, method = 'GET', body) => {
    const response = await independentFetch(
      `https://api.github.com/repos/${repository}${path}`,
      {
        method,
        redirect: 'manual',
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: `Bearer ${access}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'OpenStack-editorial-preview-panel',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
      fetcher,
    );
    if (!response.ok) throw Error('GitHub unavailable');
    return response.status === 204 ? null : response.json();
  };
  try {
    // Uploads are serialized by the existing workflow. Avoid knowingly queueing duplicate work.
    const runs = await github(
      '/actions/workflows/editorial-preview.yml/runs?branch=main&per_page=100',
    );
    if (!Array.isArray(runs.workflow_runs))
      return json(
        { error: 'Check preview build activity in GitHub before requesting another build.' },
        409,
      );
    if (runs.workflow_runs.some((run) => run.status !== 'completed'))
      return json(
        {
          error:
            'A preview build is already queued or running. Wait for it to finish, then check status.',
        },
        409,
      );
    await github('/actions/workflows/editorial-preview.yml/dispatches', 'POST', {
      ref: 'main',
      inputs: { branch, revision: status.sha },
    });
    return json({ ...base, accepted: true }, 202);
  } catch {
    return json(
      {
        error: 'GitHub could not confirm the request. Check the build history before trying again.',
      },
      503,
    );
  }
}
