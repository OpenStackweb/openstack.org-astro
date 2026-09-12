import projectRecords from '../community/projects.json' with { type: 'json' };
import memberRecords from '../community/members.json' with { type: 'json' };
import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareCommunity(content) {
  const path = '/community/';
  const html = (value) => renderEditorialBody(value ?? '', path);
  const safe = (value) => {
    const result = safeSoftwareLink(value);
    if (!result) throw new Error('Community links and images require safe HTTP(S) URLs.');
    return result;
  };
  const link = (value) => (value?.startsWith('#') ? value : reviewHref(safe(value)));
  const selection = (list, records, label) => {
    if (!Array.isArray(list)) throw new Error(`${label} selection must be a list.`);
    const ids = list.map((x) => x.id);
    if (new Set(ids).size !== ids.length)
      throw new Error(`${label} selection contains duplicates.`);
    return ids.map((id) => {
      const record = records.find((r) => r.id === id);
      if (!record) throw new Error(`Unknown ${label} in the reviewed service snapshot.`);
      return record;
    });
  };
  const person = (user) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    const country =
      user.country?.length === 2
        ? new Intl.DisplayNames(['en'], { type: 'region' }).of(user.country)
        : user.country;
    const x = (user.twitter ?? '').replace(/^@/, '');
    const linkedin = (user.linked_in ?? '').replace(/.*linkedin\.com\/in\/([^/]+)\/?.*/, '$1');
    const slug = [user.first_name, user.last_name]
      .map((n) => (n ?? '').replace(/\W+/g, ''))
      .join('-')
      .toLowerCase();
    return {
      id: user.id,
      name,
      location: [user.state, country].filter(Boolean).join(', '),
      pic: safe(user.pic),
      x: /^[A-Za-z0-9_]+$/.test(x) ? `https://x.com/${x}` : null,
      linkedIn: linkedin
        ? safe(`https://www.linkedin.com/in/${encodeURIComponent(linkedin)}`)
        : null,
      profile: link(`/community/members/profile/${user.id}/${encodeURIComponent(slug)}`),
    };
  };
  const banner = (value) => ({
    ...value,
    descriptionHtml: html(value.description),
    backgroundImage: safe(value.backgroundImage),
  });
  if (!content.topBanner?.title?.trim()) throw new Error('Community title is required.');
  const buttons = content.contributePanel.navButtons.map((b) => {
    if (b.component && b.component !== 'CodeAndDocumentation')
      throw new Error('Unknown contribution panel type.');
    return {
      ...b,
      image: safe(b.image),
      externalURL: b.externalURL ? link(b.externalURL) : '',
      items: (b.items ?? []).map((item) => ({
        ...item,
        titleHtml: html(item.title),
        options: (item.options ?? []).map((o) => ({
          ...o,
          url: b.component === 'CodeAndDocumentation' ? '' : link(o.url),
          projects: selection(o.projects ?? [], projectRecords, 'project').map((p) => ({
            ...p,
            mascot_image_url: safe(p.mascot_image_url),
            documentation_link: link(p.documentation_link),
          })),
        })),
      })),
    };
  });
  return {
    ...content,
    topBanner: banner(content.topBanner),
    contributePanel: { ...content.contributePanel, navButtons: buttons },
    quickLinks: {
      ...content.quickLinks,
      columns: content.quickLinks.columns.map((c) => ({
        ...c,
        links: c.links.map((l) => ({ ...l, url: link(l.url) })),
      })),
    },
    whereToStart: {
      ...banner(content.whereToStart),
      options: content.whereToStart.options.map((o) => ({ ...o, url: link(o.url) })),
    },
    helpBanner: {
      ...content.helpBanner,
      descriptionHtml: html(content.helpBanner.description),
      groups: ['communityManagers', 'ambassadors'].map((key) => ({
        key,
        title: content.helpBanner[key].title,
        people: selection(
          content.helpBanner[key].list.map((x) => x.user),
          memberRecords,
          'member'
        ).map(person),
      })),
    },
    communityBanner: {
      ...banner(content.communityBanner),
      list: content.communityBanner.list.map((c) => ({
        ...c,
        links: c.links.map((l) => ({ ...l, url: link(l.url) })),
      })),
    },
  };
}
