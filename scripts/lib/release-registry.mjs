import { releasePath } from '../../src/lib/server/release-announcements.mjs';
import { validateReleaseAnnouncement } from '../../tina/release-validation.mjs';

// File identity is part of the public-route contract, not merely CMS presentation.
export function validateReleaseRegistry(entries) {
  const paths = new Set();
  const checked = [];
  for (const [filename, content] of entries) {
    validateReleaseAnnouncement(content);
    const path = releasePath(content.slug);
    if (paths.has(path)) throw new Error(`Duplicate release announcement route: ${path}`);
    if (filename !== `${content.slug}.json`)
      throw new Error(`Release filename ${filename} must match its slug ${content.slug}.`);
    paths.add(path);
    checked.push(content);
  }
  return checked;
}
