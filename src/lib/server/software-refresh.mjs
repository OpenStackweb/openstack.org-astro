const repository = 'OpenStackweb/openstack.org-astro';
export const refreshWorkflowUrl = `https://github.com/${repository}/actions/workflows/software-refresh.yml`;
export const refreshPullRequestsUrl = `https://github.com/${repository}/pulls?q=is%3Apr+is%3Aopen+head%3Asoftware-refresh%2F`;
const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Authenticate Tina membership before using the fixed, server-owned GitHub dispatch capability. */
export async function handleSoftwareRefresh(request, env, published, authorize, fetcher = fetch) {
  const url = new URL(request.url);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  if (request.method === 'POST' && request.headers.get('origin') !== url.origin)
    return json({ error: 'Refresh must originate from this editor.' }, 403);
  const token = request.headers.get('authorization');
  if (!token || !env.PUBLIC_TINA_CLIENT_ID)
    return json({ error: 'Sign into Tina to manage the catalogue.' }, 401);
  try {
    const user = await authorize({ clientID: env.PUBLIC_TINA_CLIENT_ID, token });
    if (user?.verified !== true || user.enabled !== true)
      return json({ error: 'Enabled editor membership is required.' }, 403);
  } catch {
    return json({ error: 'Editor authentication is unavailable. Try again.' }, 503);
  }
  const access = env.SOFTWARE_REFRESH_GITHUB_TOKEN;
  const base = {
    published,
    workflowUrl: refreshWorkflowUrl,
    pullRequestsUrl: refreshPullRequestsUrl,
  };
  if (!access)
    return request.method === 'GET'
      ? json({ ...base, configured: false })
      : json({ error: 'The catalogue refresh connection is not configured.' }, 503);
  const github = async (path, method = 'GET', body) => {
    const response = await fetcher(`https://api.github.com/repos/${repository}${path}`, {
      method,
      redirect: 'manual',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: `Bearer ${access}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenStack-catalogue-panel',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw Error('GitHub unavailable');
    return response.status === 204 ? null : response.json();
  };
  try {
    const runs = await github(
      '/actions/workflows/software-refresh.yml/runs?branch=main&per_page=10',
    );
    const pulls = await github('/pulls?state=open&base=main&per_page=100');
    if (!Array.isArray(runs.workflow_runs) || !Array.isArray(pulls) || pulls.length === 100)
      throw Error();
    const pending = pulls.find(
      (pr) =>
        pr.head?.repo?.full_name === repository && pr.head.ref.startsWith('software-refresh/'),
    );
    const active = runs.workflow_runs.find((run) => !['completed'].includes(run.status));
    if (request.method === 'POST') {
      if (pending || active)
        return json(
          {
            error: 'A refresh is running or awaiting review. Finish it before requesting another.',
          },
          409,
        );
      await github('/actions/workflows/software-refresh.yml/dispatches', 'POST', { ref: 'main' });
      return json({ accepted: true, workflowUrl: refreshWorkflowUrl }, 202);
    }
    const latest = runs.workflow_runs[0];
    return json({
      ...base,
      configured: true,
      pending: pending
        ? {
            number: pending.number,
            url: `https://github.com/${repository}/pull/${Number(pending.number)}`,
            preview: `https://astro.openstack.org/review/branch/?branch=${encodeURIComponent(pending.head.ref)}`,
          }
        : null,
      running: Boolean(active),
      latest: latest
        ? {
            status: latest.status,
            conclusion: latest.conclusion,
            createdAt: latest.created_at,
            url: `https://github.com/${repository}/actions/runs/${Number(latest.id)}`,
          }
        : null,
    });
  } catch {
    return json(
      {
        error: 'GitHub refresh status is unavailable. Check the workflow connection and try again.',
      },
      503,
    );
  }
}
