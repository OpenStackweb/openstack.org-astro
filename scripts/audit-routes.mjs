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
  rows.push({path:page.path,status:response.status,rendering: /class="editorial-page/.test(html) ? 'native-editorial' : response.status >= 300 && response.status < 400 ? 'redirect' : 'comparison-notice'});
}
for(const path of ['/','/openstack-for-ai/','/vmware-migration-to-openstack/','/software/','/software/start/','/software/openstack-gazpacho/','/software/project-navigator/openstack-components/','/software/releases/dalmatian/components/nova']) {
  const response=await fetch(base+path);const html=await response.text();
  assert.equal(response.status,200,path);
  assert.match(html,/<h1[\s>]/,path);
  assert.doesNotMatch(html,/\[object Object\]/,path);
  assert.doesNotMatch(html,/This template or application has not been ported/,path);
  if(path.includes('project-navigator')) assert.match(html,/Nova/, 'React catalogue must be server rendered');
}
assert.equal((await fetch(base+'/a-page-that-does-not-exist/')).status,404);
const report={baseCommit:'032a17650b000ada14af6e1704d7faf16334c887',checkedAt:new Date().toISOString(),rows};
await writeFile('docs/route-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(rows.reduce((counts,row)=>(counts[row.rendering]=(counts[row.rendering]||0)+1,counts),{}));
console.log('Key routes, server-rendered React and unknown-route 404 passed.');
