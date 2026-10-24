import { requestWithMetadata } from '@tinacms/astro';
import { community, supportingOrganizations } from '../../../tina/schema/community';
import communityContent from '../content/community.json';
import organizationContent from '../content/supporting-organizations.json';
import { document } from './document';

export const loadCommunity = () => {
  const entry = document(community, 'community', communityContent);
  return requestWithMetadata({
    query: `query CommunityEditor { ${entry.selection} }`,
    variables: {},
    data: { community: entry.data },
  });
};
export const loadSupportingOrganizations = () => {
  const entry = document(supportingOrganizations, 'supporting-organizations', organizationContent);
  return requestWithMetadata({
    query: `query SupportingOrganizationsEditor { ${entry.selection} }`,
    variables: {},
    data: { supportingOrganizations: entry.data },
  });
};
