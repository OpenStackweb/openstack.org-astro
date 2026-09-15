import registry from '../content/media.json' with { type: 'json' };
import { mediaKey } from './media-assets.mjs';
import { paperDownloadFor } from './paper-downloads.mjs';
import { renderEditorialBody } from './editorial.mjs';
import routes from '../content/paper-routes.json' with { type: 'json' };
export const paperLanguages = {
  en_US: 'English',
  de_DE: 'Deutsch',
  id_ID: 'Bahasa Indonesia',
  ja_JP: '日本語',
  ko_KR: '한국어',
};
export function preparePaper(input) {
  const text = (value, max) => {
    if (typeof value !== 'string' || value.length > max) throw new Error('Invalid paper text');
    return value;
  };
  if (!Object.hasOwn(routes, input.path) || !routes[input.path].includes(input.locale))
    throw new Error('Unregistered paper or language');
  if (!/^\d+-(?:en-us|de-de|id-id|ja-jp|ko-kr)$/.test(input.slug))
    throw new Error('Invalid paper slug');
  if (!Array.isArray(input.sections) || !input.sections.length || input.sections.length > 200)
    throw new Error('Invalid paper sections');
  if (paperDownloadFor(input.path, input.locale) !== input.slug)
    throw new Error('Paper identity does not match its registered URL');
  const coverImage = input.coverImage || '';
  if (
    coverImage &&
    (!/^\/(?:assets|themes)\/[a-zA-Z0-9%_./-]+$/.test(coverImage) ||
      !Object.hasOwn(registry, mediaKey(coverImage)))
  )
    throw new Error('Unpublished cover illustration');
  const socialImage = input.socialImage || coverImage;
  if (socialImage !== coverImage &&
      (!/^\/images\/social\/[a-z0-9-]+\.(?:png|jpg|webp)$/.test(socialImage)))
    throw new Error('Invalid paper sharing image');
  if (input.socialImage && !input.socialImageAlt?.trim())
    throw new Error('Paper sharing image needs a description');
  const ids = new Set();
  const sections = input.sections.map((section) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(section.id) || ids.has(section.id))
      throw new Error('Paper anchors must be unique');
    ids.add(section.id);
    return {
      id: section.id,
      title: text(section.title, 1000),
      html: linkPaperImages(renderEditorialBody(section.body, input.path)),
    };
  });
  return {
    coverImage,
    socialImage,
    socialImageAlt: text(input.socialImageAlt ?? '', 1000),
    slug: input.slug,
    path: input.path,
    locale: input.locale,
    title: text(input.title, 1000),
    seoTitle: text(input.seoTitle || input.title, 1000),
    subtitle: text(input.subtitle || '', 2000),
    description: text(input.description || input.subtitle || '', 2000),
    sections,
    languages: routes[input.path].map((locale) => ({ locale, label: paperLanguages[locale] })),
  };
}

// Preserve existing chapter/case-study links. Wrapping their images again would
// create nested anchors and replace the intended navigation with enlargement.
function linkPaperImages(html) {
  let linked = false;
  return html.replace(/<\/?a\b[^>]*>|<img\b[^>]*>/g, (tag) => {
    if (tag.startsWith('</a')) {
      linked = false;
      return tag;
    }
    if (tag.startsWith('<a')) {
      linked = true;
      return tag;
    }
    if (linked) return tag;
    const src = /src="([^"]+)"/.exec(tag)?.[1];
    return src ? `<a href="${src}" aria-label="Enlarge illustration">${tag}</a>` : tag;
  });
}
