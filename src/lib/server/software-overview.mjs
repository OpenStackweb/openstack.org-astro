import { renderEditorialBody } from './editorial.mjs';
import { safeSoftwareLink } from '../software/catalog.mjs';
import { reviewHref } from '../legacy-routes.js';

export function prepareSoftwareOverview(content) {
  const link = (value) => (safeSoftwareLink(value) ? reviewHref(value) : null);
  const introduction = (key) => ({
    ...content[key],
    html: renderEditorialBody(content[key].abstract, '/software/'),
    link: { ...content[key].link, url: link(content[key].link.url) },
    image: { ...content[key].image, src: safeSoftwareLink(content[key].image.src) },
  });
  const action = (key) => ({
    ...content[key],
    html: renderEditorialBody(content[key].abstract, '/software/'),
    button_link: link(content[key].button_link),
  });
  return {
    ...content,
    introComponent: introduction('introComponent'),
    landscapeComponent: introduction('landscapeComponent'),
    browseProjectComponent: {
      ...content.browseProjectComponent,
      projects: content.browseProjectComponent.projects.map((project) => ({
        ...project,
        html: renderEditorialBody(project.abstract, '/software/'),
        icon: safeSoftwareLink(project.icon),
        link: { ...project.link, url: link(project.link.url) },
      })),
    },
    sampleConfigurationSection: action('sampleConfigurationSection'),
    marketplaceSection: action('marketplaceSection'),
  };
}
