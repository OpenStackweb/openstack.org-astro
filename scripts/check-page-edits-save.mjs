// Loopback-only Tina acceptance. Restores every tested file byte-for-byte.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const endpoint = 'http://localhost:4001/graphql';
assert.match(endpoint, /^http:\/\/(?:localhost|127\.0\.0\.1):\d+\/graphql$/);
const lock=JSON.parse(readFileSync('tina/tina-lock.json'));
const cases=[['use-cases','useCases','UseCases'],['marketplace-home','marketplaceHome','MarketplaceHome'],['marketplace-shared','marketplaceShared','MarketplaceShared'],['home','homepage','Homepage']];
const backups=new Map(cases.map(([file])=>[file,readFileSync(`src/lib/content/${file}.json`,'utf8')]));
function input(value,fields) {return Object.fromEntries(fields.filter(f=>f.type!=='displayOnly').flatMap(f=>{const key=f.nameOverride||f.name;if(!(key in value))return [];const v=value[key];return [[f.name,f.type==='object'&&v!=null ? f.list ? v.map(item=>input(item,f.fields)) : input(v,f.fields) : v]];}));}
async function save(file,type,params){const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:`mutation($params:${type}Mutation!){update${type}(relativePath:"${file}.json",params:$params){_sys{filename}}}`,variables:{params}}),signal:AbortSignal.timeout(15000)});const result=await r.json();assert.equal(result.errors,undefined,JSON.stringify(result.errors));return JSON.parse(readFileSync(`src/lib/content/${file}.json`));}
try {for(const [file,collection,type] of cases){const fields=lock.schema.collections.find(c=>c.name===collection).fields;const draft=input(JSON.parse(backups.get(file)),fields);
 if(file==='use-cases'){draft.youtubeId='';draft.hiddenStoryIds.push('1');}
 if(file==='marketplace-home'){draft.sectionOrder.reverse();draft.deploymentChoices.columns.reverse();draft.deploymentChoices.columns[0].items.push({title:'Local acceptance',body:'Transient local card',icon:'/images/openstack-logo.svg',id:'acceptance',cta:{label:'Browse',href:'/marketplace/'}});}
 if(file==='marketplace-shared'){draft.links.reverse();draft.links.push({label:'Local acceptance',link:'https://example.org/'});}
 if(file==='home'){draft.userStories.additionalStories.push({name:'Local acceptance',description:'Transient local feature',link:'https://example.org/',image:'/images/openstack-logo.svg',buttonText:'Read more'});}
 assert.deepEqual(input(await save(file,type,draft),fields),draft,`${collection}: editable fields survive actual save`);
 if(file==='marketplace-home'){draft.sectionOrder.pop();draft.deploymentChoices.columns[0].items.pop();}
 if(file==='marketplace-shared')draft.links.pop();
 if(file==='home')draft.userStories.additionalStories.pop();
 assert.deepEqual(input(await save(file,type,draft),fields),draft,`${collection}: removal survives actual save`);
 }
 console.log('Local Tina round trips passed: video removal, story visibility, shared resources, block/card add/reorder/remove and editorial features.');
} finally {for(const [file,bytes]of backups)writeFileSync(`src/lib/content/${file}.json`,bytes);}
