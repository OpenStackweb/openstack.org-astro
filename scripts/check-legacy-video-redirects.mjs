import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
// Local-only operator acceptance: never contact the mutating legacy detail API.
const base=new URL(process.argv[2] || '');
assert.ok(base.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(base.hostname) && Number(base.port)>0 && base.pathname==='/' && !base.search && !base.hash && !base.username && !base.password, 'Pass an explicit local HTTP Worker origin and port');
const registry=JSON.parse(await readFile(new URL('../src/lib/content/legacy-video-redirects.json',import.meta.url),'utf8'));
const jobs=Object.entries(registry).flatMap(([path,id])=>[[path,id],[path+'/',id]]);
let position=0, verified=0;
async function request(path,method='GET') {
 return fetch(base.origin+path,{method,redirect:'manual',signal:AbortSignal.timeout(10000)});
}
// A local port might still serve the legacy proxy. Check a harmless root HEAD
// before requesting any detail route, whose old controller can write statistics.
const preflight=await request('/','HEAD');
const targetMessage='Target must be the isolated Astro Worker with legacy proxy disabled';
assert.equal(preflight.headers.get('x-framework-comparison'),'astro',targetMessage);
assert.equal(preflight.headers.get('x-beta-legacy-proxy'),'disabled',targetMessage);
await Promise.all(Array.from({length:16},async()=>{
 while(position<jobs.length) {
  const [path,id]=jobs[position++];
  const response=await request(path+'?utm_source=synthetic&code=synthetic&state=synthetic');
  assert.equal(response.status,301,path);
  assert.equal(response.headers.get('location'),'https://www.youtube.com/watch?v='+id,path);
  assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  assert.equal(response.headers.get('x-beta-legacy-proxy'),'disabled');
  assert.equal(response.headers.get('set-cookie'),null);
  assert.equal(await response.text(),'');
  verified++;
 }
}));
for(const path of ['/videos/summits/virtual/Zuul-at-Volvo-Cars-Corporation','/videos/summits/virtual/Cisco-5G-Automated-Deployment','/videos/summits/vancouver-2015/dell-and-red-hat-taking-openstack-to-the-enterprise-2','/videos/summits/unknown/missing']) {
 const response=await request(path);assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);
 await response.body?.cancel();
}
const survey=await request('/user-survey/survey-2026/?code=synthetic&state=synthetic');
assert.equal(survey.status,302);assert.equal(survey.headers.get('location'),'/user-survey/?entry=annual');
assert.match(survey.headers.get('cache-control'),/no-store/);
assert.match(survey.headers.get('cache-control'),/private/);
const head=await request(Object.keys(registry)[0],'HEAD');assert.equal(head.status,301);assert.equal(await head.text(),'');
const report={checkedAt:new Date().toISOString(),scope:'Local built Worker HTTP checks; no browser/hosted acceptance or source-row refresh',registeredRoutes:Object.keys(registry).length,slashSpellingsVerified:verified,queryValuesDropped:true,previewNoindexPreserved:true,legacyProxyDisabled:true,ambiguousAndUnknownNotRedirected:4,surveyRedirect302PrivateNoStorePreserved:true,headVerified:true};
console.log(JSON.stringify(report));
