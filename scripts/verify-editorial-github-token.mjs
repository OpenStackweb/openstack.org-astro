// Read-only preflight for the private repository preview lookup.
import { resolveEditorialPreview } from '../src/lib/server/editorial-preview.mjs';

try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const token = process.env.EDITORIAL_GITHUB_TOKEN;
if (!token) {
  console.error('Missing EDITORIAL_GITHUB_TOKEN in the environment or ignored .env.');
  process.exit(1);
}
let failure;
const inspect = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    failure = {
      endpoint: url.endsWith('/status') ? 'commit status' : 'branch contents',
      status: response.status,
      permission: url.endsWith('/status') ? 'Commit statuses: Read' : 'Contents: Read',
    };
  }
  return response;
};
const result = await resolveEditorialPreview('cms/editorial-workflow-trial', inspect, token);
if (failure) {
  console.error(`GitHub ${failure.endpoint} lookup returned HTTP ${failure.status}.`);
  console.error(
    `Check repository access to OpenStackweb/openstack.org-astro and ${failure.permission}.`,
  );
  process.exit(1);
}
if (result.state === 'unavailable') {
  console.error('Preview lookup unavailable; check network access and GitHub service health.');
  process.exit(1);
}
console.log(JSON.stringify(result, null, 2));
if (!['ready', 'pending', 'failed'].includes(result.state)) process.exit(1);
