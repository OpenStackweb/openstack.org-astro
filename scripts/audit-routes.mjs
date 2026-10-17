import { auditFetchFor } from './lib/local-audit-target.mjs';
import { checkStoryRendering } from './lib/story-rendering.mjs';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import { paperDownloadAssetFor } from '../src/lib/server/paper-downloads.mjs';
import {execFileSync} from 'node:child_process';
const base = process.env.AUDIT_BASE ?? 'http://127.0.0.1:4387';
const fetch = await auditFetchFor(base);
const rows=[];
const storyCatalogue = JSON.parse(await readFile('src/lib/user-stories/catalog.json', 'utf8'));
const useCasesContent = JSON.parse(await readFile('src/lib/content/use-cases.json', 'utf8'));
let useCasesCheck;
const redirects = JSON.parse(await readFile('src/lib/content/redirects.json', 'utf8'));
assert.equal(new Set(redirects.map(rule => rule.from)).size, redirects.length, 'Redirect paths must be unique');
for (const rule of redirects) {
  for (const path of [rule.from, rule.from.replace(/\/$/, '')]) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, rule.status, `${path}: redirect status`);
    assert.equal(response.headers.get('location'), rule.to, `${path}: redirect destination`);
    assert.equal(response.headers.get('x-beta-legacy-proxy'), 'disabled');
  }
}
for(const file of await readdir('src/lib/content/pages')) {
  if(!file.endsWith('.json')) continue;
  const page=JSON.parse(await readFile('src/lib/content/pages/'+file,'utf8'));
  const response=await fetch(base+page.path,{redirect:'manual'});
  const html=await response.text();
  assert.ok(response.status === 200 || [301,302,307,308].includes(response.status),`${page.path}: expected native content or a redirect, got ${response.status}`);
  assert.equal(response.headers.get('x-beta-legacy-proxy'),'disabled');
  if (response.status === 200) {
    assert.match(html, /class="(?:editorial-page|industry-landing|summit-highlights)/, `${page.path}: imported content must render its native template`);
    assert.doesNotMatch(html, /This template or application has not been ported/, page.path);
  } else {
    assert.ok(response.headers.get('location'), `${page.path}: redirect destination required`);
  }
  rows.push({path:page.path,status:response.status,rendering: /class="(?:editorial-page|industry-landing|summit-highlights)/.test(html) ? 'native-editorial' : response.status >= 300 && response.status < 400 ? 'redirect' : 'comparison-notice'});
}
for(const path of ['/','/community/','/learn/','/coa/','/community/supporting-organizations/','/summit/boston-2017/','/use-cases/science/','/use-cases/bare-metal/','/use-cases/','/openstack-for-ai/','/vmware-migration-to-openstack/','/software/','/software/start/','/software/openstack-gazpacho/','/software/project-navigator/openstack-components/','/software/releases/dalmatian/components/nova']) {
  const response=await fetch(base+path);const html=await response.text();
  assert.equal(response.status,200,path);
  assert.match(html,/<h1[\s>]/,path);
  assert.doesNotMatch(html,/\[object Object\]/,path);
  assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${path}: one primary heading`);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1,`${path}: one canonical`);
  assert.doesNotMatch(html,/This template or application has not been ported/,path);
  if(path === '/use-cases/') useCasesCheck = checkStoryRendering(html, storyCatalogue, useCasesContent.hiddenStoryIds);
  if(path.includes('project-navigator')) assert.match(html,/Nova/, 'React catalogue must be server rendered');
}
const paperRoutes = JSON.parse(await readFile('src/lib/content/paper-routes.json','utf8'));
for (const [path, locales] of Object.entries(paperRoutes)) for (const locale of locales) {
  const response=await fetch(base+path+'?lang='+locale); const html=await response.text();
  assert.equal(response.status,200,path); assert.match(html,/class="paper-reader"/);
  assert.match(html,/class="paper-section"/); assert.match(html,/hreflang=/);
  assert.equal(html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1], locale.replace('_', '-'), `${path}: document language ${locale}`);
  assert.ok(html.includes(`<meta property="og:locale" content="${locale}"`), `${path}: Open Graph locale ${locale}`);
  const pdf=await fetch(base+path+'pdf?lang='+locale,{redirect:'manual'});
  assert.equal(pdf.status,302); assert.equal(pdf.headers.get('location'),paperDownloadAssetFor(path,locale));
}
for (const slug of JSON.parse(await readFile('src/lib/companies/profile-slugs.json','utf8'))) {
  const response=await fetch(base+'/community/supporting-organizations/profile/'+slug+'/');
  assert.equal(response.status,200,slug); assert.match(await response.text(),/class="company-page"/);
}
assert.equal((await fetch(base+'/a-page-that-does-not-exist/')).status,404);
const report={
  useCasesCheck,
  baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  workingTreeChanges:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim().split('\n').filter(Boolean),
  scope:'Local built-preview HTTP route coverage; not visual, CMS or application parity.',
  checkedAt:new Date().toISOString(),rows
};
await writeFile('docs/route-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(rows.reduce((counts,row)=>(counts[row.rendering]=(counts[row.rendering]||0)+1,counts),{}));
console.log('Key routes, server-rendered React and unknown-route 404 passed.');
