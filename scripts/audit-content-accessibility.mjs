// Static review candidates, not a substitute for browser accessibility testing.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { parseDocument, DomUtils } from 'htmlparser2';
import { pathToFileURL } from 'node:url';

export function inspectContent(html) {
  const document = parseDocument(html);
  const all = DomUtils.findAll(() => true, document.children);
  const main = all.find(el => el.name === 'main');
  if (!main) return [{ kind: 'main-missing' }];
  const elements = DomUtils.findAll(() => true, main.children);
  const hidden = el => {
    for (let node = el; node; node = node.parent) {
      if (node.attribs && ('hidden' in node.attribs || node.attribs['aria-hidden'] === 'true')) return true;
    }
    return false;
  };
  const text = node => {
    if (node.type === 'text') return node.data;
    if (hidden(node)) return '';
    if (['input', 'select', 'textarea'].includes(node.name)) return ''; // Values/options are not labels.
    if (node.name === 'img') return node.attribs.alt || '';
    if (node.name === 'svg') return node.attribs['aria-label'] || DomUtils.textContent(node);
    return (node.children || []).map(text).join(' ');
  };
  const name = el => {
    const refs = (el.attribs['aria-labelledby'] || '').split(/\s+/).filter(Boolean);
    const referenceText = refs.map(id => all.find(node => node.attribs?.id === id)).filter(Boolean).map(DomUtils.textContent).join(' ');
    const explicitLabels = all.filter(node => node.name === 'label' && el.attribs.id && node.attribs.for === el.attribs.id);
    let wrappingLabel = el.parent;
    while (wrappingLabel && wrappingLabel.name !== 'label') wrappingLabel = wrappingLabel.parent;
    const labelText = [...explicitLabels, ...(wrappingLabel ? [wrappingLabel] : [])].map(text).join(' ').trim();
    const inputName = el.name === 'input' && ['submit', 'reset', 'button'].includes(el.attribs.type)
      ? (el.attribs.value || (el.attribs.type === 'submit' ? 'Submit' : el.attribs.type === 'reset' ? 'Reset' : ''))
      : el.name === 'input' && el.attribs.type === 'image' ? el.attribs.alt || '' : '';
    return referenceText.trim() || el.attribs['aria-label']?.trim() || labelText || inputName || (['input', 'select', 'textarea'].includes(el.name) ? '' : text(el).trim()) || el.attribs.title?.trim() || '';
  };
  const issues = [];
  for (const el of elements) {
    if (hidden(el)) continue;
    if (el.name === 'a' && 'href' in el.attribs && !name(el)) {
      issues.push({ kind: 'unnamed-link', href: el.attribs.href, image: DomUtils.findOne(n => n.name === 'img', el.children)?.attribs.src || null });
    }
    if (/^h[1-6]$/.test(el.name) && !name(el)) issues.push({ kind: 'empty-heading', tag: el.name });
    if (['button', 'input', 'select', 'textarea'].includes(el.name) &&
        !(el.name === 'input' && el.attribs.type === 'hidden') && !name(el)) {
      issues.push({ kind: 'unnamed-control', tag: el.name, type: el.attribs.type || null, id: el.attribs.id || null });
    }
    if (el.name === 'img' && !('alt' in el.attribs) && !['none', 'presentation'].includes(el.attribs.role)) {
      issues.push({ kind: 'image-alt-missing', src: el.attribs.src || null });
    }
  }
  return issues;
}
async function run() {
  const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4433';
  assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
  const editorialPaths = JSON.parse(await readFile('src/lib/content/editorial-paths.json', 'utf8'));
  // Dedicated templates are outside the imported HTML cohort but still need the
  // same baseline checks. Client-rendered application states require browser QA.
  const mainPaths = [
    '/', '/use-cases/', '/use-cases/edge-computing/', '/openstack-for-ai/',
    '/vmware-migration-to-openstack/', '/community/', '/community/supporting-organizations/',
    '/learn/', '/coa/', '/marketing/', '/software/', '/software/start/', '/videos/',
    '/search/', '/summit/other-summits/', '/events/opendev-2020/',
  ];
  const paths = [...new Set([...editorialPaths, ...mainPaths])];
  const rows = []; let index = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (index < paths.length) {
      const path = paths[index++];
      try {
        const response = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
        rows.push({ path, status: response.status, issues: response.status === 200 ? inspectContent(await response.text()) : [{ kind: 'not-rendered-200' }] });
      } catch { rows.push({ path, issues: [{ kind: 'request-failed' }] }); }
    }
  }));
  rows.sort((a,b) => a.path.localeCompare(b.path));
  const counts = {};
  for (const row of rows) for (const issue of row.issues) counts[issue.kind] = (counts[issue.kind] || 0) + 1;
  await writeFile('docs/content-accessibility-audit.json', JSON.stringify({
    checkedAt: new Date().toISOString(), revision: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), base,
    worktreeChanges: execFileSync('git',['status','--short'],{encoding:'utf8'}).trim().split('\n').filter(Boolean),
    scope: 'Static main-content review candidates for image alt presence, link/control naming and empty headings in the imported editorial cohort and 16 explicit main/structured routes. Does not implement the full accessible-name algorithm, evaluate CSS visibility, alt-text quality, keyboard behavior, contrast, media alternatives or client-rendered application states. Build identity must be verified separately.',
    sourceCount: paths.length, counts, rows,
  }, null, 2) + '\n');
  console.log({sourceCount: paths.length, counts});
  if (counts['request-failed'] || counts['not-rendered-200'] || counts['main-missing']) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await run();
