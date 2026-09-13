import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const lock=JSON.parse(readFileSync(new URL('../../tina/tina-lock.json',import.meta.url),'utf8'));
function covered(value,fields,path){
  const known=new Map(fields.map(f=>[f.name,f]));
  for(const [key,item] of Object.entries(value)) {
    assert.ok(known.has(key),`${path}.${key} would be lost on a CMS save`);
    const field=known.get(key);
    if(field.type==='object') for(const child of field.list ? item : [item]) covered(child,field.fields,`${path}.${key}`);
  }
}
test('Tina schema covers every stored homepage and announcement field',()=>{
  for(const [name,file] of [['homepage','home'],['announcement','announcement-banner']]){
    const collection=lock.schema.collections.find(c=>c.name===name);
    assert.ok(collection);
    assert.deepEqual(collection.match,{include:file});
    covered(JSON.parse(readFileSync(new URL(`../../src/lib/content/${file}.json`,import.meta.url),'utf8')),collection.fields,name);
  }
});
test('Homepage story selections reference preserved service-owned records',()=>{
 const home=JSON.parse(readFileSync(new URL('../../src/lib/content/home.json',import.meta.url),'utf8'));
 const records=JSON.parse(readFileSync(new URL('../../src/lib/content/home-story-records.json',import.meta.url),'utf8'));
 for(const story of home.userStories.stories){assert.ok(records[story.storyId]);assert.equal('userStory' in story,false);}
 const fields=lock.schema.collections.find(c=>c.name==='homepage').fields.find(f=>f.name==='userStories').fields.find(f=>f.name==='stories').fields;
 assert.deepEqual(fields.map(f=>f.name).sort(),['buttonText','image','storyId']);
});
