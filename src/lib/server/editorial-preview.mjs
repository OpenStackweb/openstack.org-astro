import { independentFetch } from '../network/upstream.mjs';
const repo = 'https://api.github.com/repos/OpenStackweb/openstack.org-astro';
export const editorialStatusContext = 'OpenStack editorial preview';

export function validEditorialBranch(branch) {
  return (
    typeof branch === 'string' &&
    branch.length <= 200 &&
    /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(branch) &&
    !branch.includes('..') &&
    !branch.includes('//') &&
    !branch.endsWith('/') &&
    !branch.endsWith('.') &&
    !branch.endsWith('.lock')
  );
}

export async function resolveEditorialPreview(branch, fetcher = fetch, token) {
  const guardedFetch = (input, options) => independentFetch(input, options, fetcher);
  if (!validEditorialBranch(branch)) return { state: 'invalid' };
  if (branch === 'main') return { state: 'main', url: 'https://astro.openstack.org/' };
  if (!token) return { state: 'unavailable' };
  const request = async (path) =>
    guardedFetch(`${repo}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'OpenStack-Astro-editorial-preview',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  try {
    const head = await request(`/commits/${encodeURIComponent(branch)}`);
    if (head.status === 404 || head.status === 422) return { state: 'missing' };
    if (!head.ok) return { state: 'unavailable' };
    const { sha } = await head.json();
    if (!/^[a-f0-9]{40}$/.test(sha || '')) return { state: 'unavailable' };
    const response = await request(`/commits/${sha}/status`);
    if (!response.ok) return { state: 'unavailable', sha };
    const data = await response.json();
    if (data.sha !== sha || !Array.isArray(data.statuses)) return { state: 'unavailable', sha };
    // The combined-status endpoint returns the latest status for each context.
    const status = data.statuses.find((item) => item.context === editorialStatusContext);
    if (!status || status.state === 'pending') return { state: 'pending', sha };
    if (status.state !== 'success') return { state: 'failed', sha };
    if (
      !/^https:\/\/[a-f0-9]{8}-openstack-org-astro-editorial\.openstack-review\.workers\.dev\/?$/.test(
        status.target_url || '',
      )
    )
      return { state: 'unavailable', sha };
    // A branch push while the status request is in flight must not make an
    // older successful build look like the latest changes.
    const latestResponse = await request(`/commits/${encodeURIComponent(branch)}`);
    if (!latestResponse.ok) return { state: 'unavailable', sha };
    const latest = await latestResponse.json();
    if (!/^[a-f0-9]{40}$/.test(latest.sha || '')) return { state: 'unavailable', sha };
    if (latest.sha !== sha) return { state: 'pending', sha: latest.sha };
    return { state: 'ready', sha, url: status.target_url };
  } catch {
    return { state: 'unavailable' };
  }
}
