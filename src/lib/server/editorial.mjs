import { prepareIndustry } from './industry.mjs';
import { prepareHighlights } from './summit-highlights.mjs';
import { editorialVideo } from './editorial-video.mjs';
import { prepareLocations } from './archive-locations.mjs';
import { prepareSponsors } from './sponsor-archives.mjs';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import { reviewHref } from '../legacy-routes.js';

export function canonicalContentPath(value) {
  if (typeof value !== 'string' || !/^\/(?:[a-z0-9][a-z0-9-]*\/)+$/.test(value))
    throw new Error('Editorial paths must contain lowercase URL segments and end with a slash.');
  if (/^\/(?:admin|auth|review|api|profile|userprofile|software)(?:\/|$)/.test(value))
    throw new Error('This path is reserved for an application route.');
  return value;
}

export function renderEditorialBody(body, path) {
  if (typeof body !== 'string' || body.length > 500_000)
    throw new Error('Editorial body is missing or too large.');
  const html = marked.parse(body, { async: false });
  return sanitizeHtml(html, {
    allowedTags: [
      'iframe',
      'details',
      'summary',
      'p',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'strong',
      'em',
      'b',
      'i',
      'u',
      's',
      'br',
      'hr',
      'blockquote',
      'pre',
      'code',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'dl',
      'dt',
      'dd',
      'figure',
      'figcaption',
      'img',
      'div',
      'span',
      'sup',
      'sub',
    ],
    allowedIframeHostnames: ['www.youtube-nocookie.com'],
    exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
    allowedAttributes: {
      iframe: ['src', 'title', 'loading', 'allowfullscreen', 'referrerpolicy', 'allow'],
      '*': ['id'],
      a: ['href', 'title', 'target', 'rel', 'class', 'aria-label'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      ol: ['start'],
      div: ['class'],
      h5: ['class'],
      i: ['class', 'aria-hidden'],
      details: ['class'],
    },
    allowedClasses: {
      a: ['start-btn', 'featured-site', 'guide-icons'],
      i: ['fa', 'fa-music', 'fa-cutlery', 'fa-beer', 'fa-tree', 'fa-institution', 'fa-map-signs'],
      h5: ['section-title', 'guide'],
      div: [
        'archive-landing',
        'guide-listing',
        'featured-guide-row',
        'featured-content',
        'address',
        'guide-name',
        'image-wrapper',
        'featured',
        'guide-nav',
        'guide-icons-wrapper',
        'industry-content',
        'industry-grid',
        'industry-card',
      ],
      details: ['archive-details'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      iframe: (_tag, attrs) => ({ tagName: 'iframe', attribs: editorialVideo(attrs) || {} }),
      h1: 'h2',
      i: (_tag, attrs) => ({ tagName: 'i', attribs: { ...attrs, ...(attrs.class?.split(/\s+/).includes('fa') ? { 'aria-hidden': 'true' } : {}) } }),
      a: (_tag, attributes) => {
        const attrs = { ...attributes };
        if (attrs.href) {
          // SilverStripe's base tag makes legacy relative links root-relative.
          // Imported links are normalized; new Markdown links use this page's URL.
          try {
            const url = new URL(attrs.href, `https://www.openstack.org${path}`);
            attrs.href = attrs.href.startsWith('#') ? attrs.href : reviewHref(url.href);
          } catch {
            delete attrs.href;
          }
        }
        if (attrs.target === '_blank') attrs.rel = 'noopener noreferrer';
        else delete attrs.target;
        return { tagName: 'a', attribs: attrs };
      },
      img: (_tag, attrs) => ({
        tagName: 'img',
        attribs: { ...attrs, loading: 'lazy', alt: attrs.alt || '' },
      }),
    },
  });
}

export function prepareEditorialPage(input, { draft = false } = {}) {
  const path = canonicalContentPath(input.path);
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 250)
    throw new Error('Editorial title is required.');
  const description = input.description ?? '';
  if (typeof description !== 'string' || description.length > 2000)
    throw new Error('Invalid editorial description.');
  const seoTitle = input.seoTitle ?? input.title;
  if (typeof seoTitle !== 'string' || seoTitle.length > 250)
    throw new Error('Invalid editorial SEO title.');
  const socialImageAlt = input.socialImageAlt ?? '';
  if (typeof socialImageAlt !== 'string' || socialImageAlt.length > 1000)
    throw new Error('Invalid sharing image description.');
  const archiveEvent = input.archiveEvent || '';
  if (typeof archiveEvent !== 'string' || (archiveEvent && !/^[a-z0-9-]+$/.test(archiveEvent)))
    throw new Error('Invalid archive event reference.');
  const archiveNotice = input.archiveNotice ?? '';
  if (typeof archiveNotice !== 'string' || archiveNotice.length > 1000)
    throw new Error('Invalid archive notice.');
  const sectionNavigation = input.sectionNavigation ?? [];
  if (!Array.isArray(sectionNavigation) || sectionNavigation.length > 30)
    throw new Error('Invalid section navigation.');
  const links = sectionNavigation.map((item) => {
    if (
      typeof item.label !== 'string' ||
      !item.label.trim() ||
      item.label.length > 250 ||
      typeof item.url !== 'string'
    )
      throw new Error('Invalid section link.');
    const url = new URL(item.url, 'https://www.openstack.org/');
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Unsafe section link.');
    return { label: item.label, url: reviewHref(url.href) };
  });
  let scienceBook;
  if (input.scienceBook) {
    scienceBook = {};
    for (const field of ['title', 'description', 'bookUrl', 'printUrl', 'amazonUrl']) {
      const value = input.scienceBook[field] ?? '';
      if (typeof value !== 'string' || value.length > 3000)
        throw new Error('Invalid Science book field.');
      if (field.endsWith('Url') && value) {
        const url = new URL(value, 'https://www.openstack.org/');
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
          throw new Error('Unsafe Science book link.');
        scienceBook[field] = reviewHref(url.href);
      } else scienceBook[field] = value;
    }
  }
  const venueLinks = input.venueLinks ?? [];
  let newsletter;
  let hero;
  if (input.hero) {
    const subtitle = input.hero.subtitle ?? '';
    if (
      typeof input.hero.image !== 'string' ||
      !/^\/(?:assets|images|review\/media\/[a-f0-9]{40})\/[a-zA-Z0-9/._-]+$/.test(
        input.hero.image
      ) ||
      input.hero.image.includes('..') ||
      typeof subtitle !== 'string' ||
      subtitle.length > 3000
    )
      throw new Error('Invalid industry hero content.');
    hero = { image: input.hero.image, subtitle: subtitle.trim() };
  }
  if (input.industry && !hero) throw new Error('A structured industry page requires its hero.');
  if (input.newsletter) {
    newsletter = {};
    for (const field of ['title', 'description', 'emailLabel', 'placeholder', 'buttonLabel']) {
      const value = input.newsletter[field];
      if (typeof value !== 'string' || !value.trim() || value.length > 2000)
        throw new Error('Invalid industry newsletter content.');
      newsletter[field] = value.trim();
    }
  }
  if (
    !Array.isArray(venueLinks) ||
    venueLinks.length > 500 ||
    venueLinks.some(
      (link) => !/^(room|venue)=\d+$/.test(link.hash) || !/^(venue-|floor_)\d+$/.test(link.target)
    )
  )
    throw new Error('Invalid venue deep links.');
  return {
    ...(input.highlights
      ? {
          highlights: prepareHighlights(input.highlights, (body) =>
            renderEditorialBody(body, path), { draft }
          ),
        }
      : {}),
    ...(input.industry
      ? { industry: prepareIndustry(input.industry, (body) => renderEditorialBody(body, path)) }
      : {}),
    ...(scienceBook ? { scienceBook } : {}),
    ...(newsletter ? { newsletter } : {}),
    ...(hero ? { hero } : {}),
    ...(venueLinks.length ? { venueLinks } : {}),
    title: input.title,
    seoTitle,
    socialImageAlt,
    archiveNotice,
    archiveEvent,
    sectionNavigation: links,
    path,
    description,
    html: renderEditorialBody(input.body ?? '', path),
    ...(input.sponsors
      ? { sponsors: prepareSponsors(input.sponsors, (body) => renderEditorialBody(body, path)) }
      : {}),
    ...(input.locations?.length
      ? { locations: prepareLocations(input.locations, (body) => renderEditorialBody(body, path)) }
      : {}),
    ...(input.faq ? { faq: prepareFaq(input.faq, path, draft) } : {}),
  };
}

function prepareFaq(input, path, draft = false) {
  input = { ...input, categories: input.categories ?? [] };
  if (draft) {
    const used = new Set();
    input.categories = input.categories.map((category, index) => {
      let id = category.id;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || used.has(id)) id = `draft-topic-${index}`;
      while (used.has(id)) id += '-draft';
      used.add(id);
      return { ...category, id, title: category.title?.trim() || 'Untitled topic',
        questions: (category.questions ?? []).map(item => ({ ...item,
          question: item.question?.trim() || 'Untitled question', answer: item.answer ?? '' })) };
    });
    input.emptyMessage ||= 'No questions are currently published for this archived event.';
    input.contactTitle ||= 'Contact';
    input.contactBody ||= '';
  }
  if (!Array.isArray(input.categories) || input.categories.length > 50)
    throw new Error('Invalid FAQ categories.');
  const text = (value, max = 2000) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      throw new Error('Invalid FAQ text.');
    return value.trim();
  };
  const ids = new Set();
  const categories = input.categories.map((category) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category.id) || ids.has(category.id))
      throw new Error('FAQ category IDs must be unique.');
    ids.add(category.id);
    if (!Array.isArray(category.questions ?? []) || (category.questions ?? []).length > 200)
      throw new Error('Invalid FAQ questions.');
    return {
      id: category.id,
      title: text(category.title, 250),
      questions: (category.questions ?? []).map((item) => {
        const question = text(item.question);
        const html = renderEditorialBody(item.answer, path);
        const answerText = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
        return { question, html, searchText: (question + ' ' + answerText).toLocaleLowerCase() };
      }),
    };
  });
  return {
    categories,
    emptyMessage: text(input.emptyMessage),
    contactTitle: text(input.contactTitle, 250),
    contactHtml: renderEditorialBody(input.contactBody, path),
  };
}
