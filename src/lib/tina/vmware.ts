import { requestWithMetadata } from '@tinacms/astro';
import { vmware } from '../../../tina/schema/vmware';
import content from '../content/vmware-migration.json';
import { document } from './site';
export function loadVmware() {
  const entry = document(vmware, 'vmware-migration', content);
  return requestWithMetadata({ query: `query VmwareEditor { ${entry.selection} }`, variables: {}, data: { vmware: entry.data } });
}
