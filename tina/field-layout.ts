import type { CSSProperties } from 'react';

// Native fieldsets default to min-content sizing; nested CMS lists must be able
// to shrink inside Tina's mobile panel. Explicit wrapping also overrides Tina's
// inherited helper-text whitespace rule.
export const listFieldStyle: CSSProperties = {
  minWidth: 0,
  maxWidth: '100%',
  marginInline: 0,
  padding: 0,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
};

export const listItemStyle: CSSProperties = { minWidth: 0, maxWidth: '100%' };
export const fieldHelpStyle: CSSProperties = { whiteSpace: 'normal', overflowWrap: 'anywhere' };
