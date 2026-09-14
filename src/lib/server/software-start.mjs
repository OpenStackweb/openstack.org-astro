import { safeSoftwareLink } from '../software/catalog.mjs';
const sectionKeys = ['trySection', 'learn', 'nextSteps'];
const deploymentKeys = ['distributions', 'howto', 'companies', 'download', 'tools'];

export function validateSoftwareStart(content) {
  const heading = (value) => {
    if (typeof value !== 'string' || !value.trim() || value.length > 2000)
      throw new Error('Each page, section and card needs a heading of at most 2,000 characters.');
  };
  const rows = (value) => {
    if (value == null) return [];
    if (!Array.isArray(value) || value.length > 200) throw new Error('Use at most 200 items per list.');
    return value;
  };
  const link = (value) => {
    if (typeof value !== 'string' || !safeSoftwareLink(value)) throw new Error('Use a valid HTTP(S) or relative destination.');
  };
  const card = (value) => {
    heading(value?.title);
    if (value.logo) link(value.logo);
    for (const action of rows(value.actions)) { heading(action.label); link(action.url); }
    for (const resource of rows(value.list)) { heading(resource.title); link(resource.url); }
  };
  heading(content.pageTitle); heading(content.title);
  for (const key of sectionKeys) {
    heading(content[key]?.title);
    for (const item of rows(content[key].content)) card(item);
  }
  heading(content.deploy?.title);
  for (const key of deploymentKeys) card(content.deploy[key]);
  return content;
}

/** Incomplete editor drafts and explicitly cleared optional lists stay renderable. */
export function prepareSoftwareStart(raw) {
  const links = (items) => (items ?? []).map(item => ({ ...item, url: safeSoftwareLink(item?.url) ? item.url : '#' }));
  const card = (value = {}) => ({ ...value,
    logo: safeSoftwareLink(value.logo) ? value.logo : '',
    actions: links(value.actions), list: links(value.list),
  });
  const result = { ...raw };
  for (const key of sectionKeys) result[key] = { ...raw[key], content: (raw[key]?.content ?? []).map(card) };
  result.deploy = { ...raw.deploy };
  for (const key of deploymentKeys) result.deploy[key] = card(raw.deploy?.[key] ?? {});
  return result;
}
