import type { Collection, TinaField } from 'tinacms';

// Produce Tina's schema-matched query and document metadata from committed Git content.
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
        : value[field.name] == null
          ? null
          : annotate(value[field.name], field.fields!, name);
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
