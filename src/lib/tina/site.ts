import { requestWithMetadata } from '@tinacms/astro';
import type { Collection, TinaField } from 'tinacms';
import { homepage, announcement } from '../../../tina/schema/site';
import { softwareOverview } from '../../../tina/schema/software';
import softwareContent from '../content/software-overview.json';
import homeContent from '../content/home.json';
import bannerContent from '../content/announcement-banner.json';

const upper = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
const selection = (fields: TinaField[]): string =>
  fields
    .map((field) =>
      field.type === 'object' && 'fields' in field
        ? `${field.name} { __typename ${selection(field.fields!)} }`
        : field.name,
    )
    .join(' ');
function annotate(value: any, fields: TinaField[], typename: string): any {
  const result = { ...value, __typename: typename };
  for (const field of fields) {
    if (field.nameOverride) {
      result[field.name] = value[field.nameOverride];
      delete result[field.nameOverride];
    }
    if (field.type === 'object' && 'fields' in field) {
      const name = typename + upper(field.name);
      result[field.name] = field.list
        ? (value[field.name] || []).map((item: any) => annotate(item, field.fields!, name))
        : value[field.name] == null ? null : annotate(value[field.name], field.fields!, name);
    }
  }
  return result;
}
export function document(collection: Collection, filename: string, content: unknown) {
  const fields = collection.fields!;
  const path = `${collection.path}/${filename}.json`;
  return {
    selection: `${collection.name}(relativePath: "${filename}.json") { __typename ${selection(fields)} id _sys { filename basename breadcrumbs path relativePath extension } }`,
    data: {
      ...annotate(content, fields, upper(collection.name)),
      id: path,
      _sys: {
        filename,
        basename: `${filename}.json`,
        breadcrumbs: [filename],
        path,
        relativePath: `${filename}.json`,
        extension: '.json',
      },
    },
  };
}
const home = document(homepage, 'home', homeContent);
const banner = document(announcement, 'announcement-banner', bannerContent);
const software = document(softwareOverview, 'software-overview', softwareContent);
// Visitors render committed Git content. Tina uses this schema-matched metadata
// to replace only the editing preview, without a CMS request on normal page views.
export const loadHomepage = () =>
  requestWithMetadata({
    query: `query HomepageEditor { ${home.selection} ${banner.selection} }`,
    variables: {},
    data: { homepage: home.data, announcement: banner.data },
  });
export const loadAnnouncement = () =>
  requestWithMetadata({
    query: `query AnnouncementEditor { ${banner.selection} }`,
    variables: {},
    data: { announcement: banner.data },
  });
export const loadSoftwareOverview = () =>
  requestWithMetadata({
    query: `query SoftwareOverviewEditor { ${software.selection} }`,
    variables: {},
    data: { softwareOverview: software.data },
  });
