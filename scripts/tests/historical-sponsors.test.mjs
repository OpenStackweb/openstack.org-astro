import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { prepareSponsors } from '../../src/lib/server/sponsor-archives.mjs';

test('historical sponsors preserve names without inventing missing links or images', () => {
  const prepare = sponsor => prepareSponsors({groups:[{title:'Startup Sponsors',columns:3,sponsors:[sponsor]}]}, value=>value).groups[0].sponsors[0];
  assert.deepEqual(prepare({name:'Historical company',url:'',image:''}),{name:'Historical company',url:'',image:''});
  assert.throws(()=>prepare({name:'Unsafe',url:'javascript:alert(1)',image:''}));
  assert.throws(()=>prepare({name:'Unsafe',url:'https://example.org',image:'/assets/../private.png'}));
});

test('four approved sponsor archives retain all 231 relationships and approved media', async () => {
  const report=JSON.parse(await readFile('docs/historical-sponsor-coverage.json','utf8'));
  const registry=JSON.parse(await readFile('src/lib/content/media.json','utf8'));
  const editor=JSON.parse(await readFile('tina/editorial-pages.json','utf8'));
  let total=0;
  for(const expected of report.pages){
    const page=JSON.parse(await readFile(`src/lib/content/pages/${expected.filename}`,'utf8'));
    const result=prepareSponsors(page.sponsors,value=>value);
    assert.equal(page.path,expected.path);
    assert.match(page.archiveNotice,/Historical sponsor archive/);
    assert.ok(!editor.some(row=>row.path===page.path),'Approved Git-only archive must not expose unsupported Tina fields');
    const sponsors=result.groups.flatMap(group=>group.sponsors);
    assert.equal(sponsors.length,expected.entries);
    total+=sponsors.length;
    for(const sponsor of sponsors) if(sponsor.image) assert.ok(registry[sponsor.image.slice(1)]);
  }
  assert.equal(total,231);
});
