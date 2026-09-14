import { reviewHref } from '../legacy-routes.js';
import { prepareHighlightsContent } from '../../../tina/highlights-validation.mjs';

export function prepareHighlights(input, render, options = {}) {
  return prepareHighlightsContent(input, render, { ...options, resolveHref: reviewHref });
}
