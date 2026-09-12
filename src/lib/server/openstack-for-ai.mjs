import companies from '../companies/ai-contributors.json' with { type: 'json' };
import { prepareMarketingLanding } from './marketing-landing.mjs';
export function prepareOpenstackForAi(content) {
  return prepareMarketingLanding(content, companies, '/openstack-for-ai/');
}
