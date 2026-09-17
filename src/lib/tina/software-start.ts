import { requestWithMetadata } from '@tinacms/astro';
import { softwareStart } from '../../../tina/schema/software-start';
import content from '../content/software-start.json';
import { document } from './document';
export const loadSoftwareStart = () => {
  const entry = document(softwareStart, 'software-start', content);
  return requestWithMetadata({
    query: `query SoftwareStartEditor { ${entry.selection} }`,
    variables: {},
    data: { softwareStart: entry.data },
  });
};
