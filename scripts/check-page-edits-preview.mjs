import assert from 'node:assert/strict';
import { parseDocument, DomUtils } from 'htmlparser2';
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:4390';
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/);
const nodes = html => DomUtils.findAll(n => n.type === 'tag', parseDocument(html).children);
async function render(name,data={},prime=false,query='') {
 const r=await fetch(`${base}/tina-island/${name}${query}`,{method:'POST',headers:{'content-type':'application/x-tina-preview+json',...(prime?{'X-Tina-Prime':'1'}:{})},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
 assert.equal(r.status,200,await r.clone().text());return nodes(await r.text());
}
async function draft(name, mutate, verify, query='') {
 const initial=await render(name,{},true,query);
 const form=JSON.parse(initial.find(n=>n.attribs['data-tina-form']).attribs['data-tina-form']);
 const data=structuredClone(form.data);mutate(data);
 verify(await render(name,{[form.id]:data},false,query));
 const baseline=await render(name,{},false,query);
 assert.deepEqual(baseline.filter(n=>['h1','h2','h3'].includes(n.name)).map(DomUtils.textContent),initial.filter(n=>['h1','h2','h3'].includes(n.name)).map(DomUtils.textContent),'Preview must not change visitor baseline');
}
await draft('use-cases',data=>{data.useCases.youtubeId='';data.useCases.hiddenStoryIds.push('79');},result=>{assert.ok(!result.some(n=>n.attribs['data-play-video']!==undefined));assert.ok(!result.some(n=>n.attribs['data-story']&&JSON.parse(n.attribs['data-story']).id===79));assert.ok(result.some(n=>n.attribs['data-story']));});
await draft('marketplace-home',data=>{data.marketplaceHome.sectionOrder=[{key:'drivers'},{key:'deploymentChoices'}];data.marketplaceHome.deploymentChoices.columns=[];},result=>{const headings=result.filter(n=>n.name==='h2').map(DomUtils.textContent);assert.equal(headings.length,2);assert.match(headings[0],/DRIVERS/i);});
await draft('marketplace-shared',data=>{data.marketplaceShared.links=[{label:'Preview resource',link:'https://example.org/preview'}];},result=>{assert.ok(result.some(n=>n.name==='a'&&n.attribs.href==='https://example.org/preview'));});
await draft('marketplace',data=>{data.marketplacePage.icon='/images/openstack-logo.svg';},result=>{assert.ok(result.some(n=>n.name==='img'&&n.attribs.src==='/images/openstack-logo.svg'));},'?document=training&section=icon');
console.log('Tina previews passed: removable video, story visibility, block order/removal, cleared cards, shared links, editable category icons and unchanged baselines.');
