import {readFile,readdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.AUDIT_BASE ?? 'http://127.0.0.1:4387';
assert.ok(/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(base),'Audit only a local built preview.');
const rows=[];
for(const file of await readdir('src/lib/content/pages')) {
  if(!file.endsWith('.json')) continue;
  const page=JSON.parse(await readFile('src/lib/content/pages/'+file,'utf8'));
  const response=await fetch(base+page.path,{redirect:'manual'});
  const html=await response.text();
  assert.ok(response.status < 500,`${page.path}: ${response.status}`);
  assert.equal(response.headers.get('x-beta-legacy-proxy'),'disabled');
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
  if(path === '/use-cases/') assert.equal((html.match(/data-story=/g) || []).length,74,'All stories must be server rendered');
  if(path.includes('project-navigator')) assert.match(html,/Nova/, 'React catalogue must be server rendered');
}
const paperRoutes = JSON.parse(await readFile('src/lib/content/paper-routes.json','utf8'));
for (const [path, locales] of Object.entries(paperRoutes)) for (const locale of locales) {
  const response=await fetch(base+path+'?lang='+locale); const html=await response.text();
  assert.equal(response.status,200,path); assert.match(html,/class="paper-reader"/);
  assert.match(html,/class="paper-section"/); assert.match(html,/hreflang=/);
  const pdf=await fetch(base+path+'pdf?lang='+locale,{redirect:'manual'});
  assert.equal(pdf.status,302); assert.match(pdf.headers.get('location'),/^\/assets\/research-pdfs\/[0-9]+-[a-z]{2}-[a-z]{2}\.pdf$/);
}
for (const slug of JSON.parse(await readFile('src/lib/companies/profile-slugs.json','utf8'))) {
  const response=await fetch(base+'/community/supporting-organizations/profile/'+slug+'/');
  assert.equal(response.status,200,slug); assert.match(await response.text(),/class="company-page"/);
}
assert.equal((await fetch(base+'/a-page-that-does-not-exist/')).status,404);
const report={baseCommit:'032a17650b000ada14af6e1704d7faf16334c887',checkedAt:new Date().toISOString(),rows};
await writeFile('docs/route-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(rows.reduce((counts,row)=>(counts[row.rendering]=(counts[row.rendering]||0)+1,counts),{}));
console.log('Key routes, server-rendered React and unknown-route 404 passed.');
