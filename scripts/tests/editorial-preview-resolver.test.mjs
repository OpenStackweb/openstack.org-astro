import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEditorialPreview, editorialStatusContext } from '../../src/lib/server/editorial-preview.mjs';
const sha='a'.repeat(40);
const url='https://123abcde-openstack-org-astro-editorial.openstack-review.workers.dev';
const status={context:editorialStatusContext,state:'success',target_url:url};
function fixture(statuses=[status], statusSha=sha) {
  const calls=[];
  return {calls,fetcher:async address=>{
    calls.push(address);
    return new Response(JSON.stringify(calls.length===1?{sha}:{sha:statusSha,statuses}));
  }};
}
test('resolves only the current commit successful immutable preview',async()=>{
  const f=fixture(); assert.deepEqual(await resolveEditorialPreview('cms/story',f.fetcher,'test-token'),{state:'ready',sha,url});
  assert.ok(f.calls[0].endsWith('/commits/cms%2Fstory'));
  assert.ok(f.calls[1].endsWith(`/commits/${sha}/status`));
});
test('does not return links for absent, failed, wrong-revision or untrusted preview statuses',async()=>{
  for(const [statuses,statusSha,expected] of [
    [[],sha,'pending'], [[{...status,state:'pending'}],sha,'pending'],
    [[{...status,state:'failure'}],sha,'failed'], [[status],'b'.repeat(40),'unavailable'],
    [[{...status,target_url:'https://example.com'}],sha,'unavailable'],
    [[{...status,target_url:url+'/?redirect=elsewhere'}],sha,'unavailable'],
    [[{...status,context:'different-build'}],sha,'pending'],
  ]) {const f=fixture(statuses,statusSha);const r=await resolveEditorialPreview('cms/story',f.fetcher,'test-token');assert.equal(r.state,expected);assert.equal(r.url,undefined);}
});
test('missing branches and API failures have explicit states',async()=>{
  for(const [code,state] of [[404,'missing'],[422,'missing'],[403,'unavailable'],[500,'unavailable']])
    assert.equal((await resolveEditorialPreview('cms/story',async()=>new Response('{}',{status:code}),'test-token')).state,state);
  assert.equal((await resolveEditorialPreview('cms/story',async()=>{throw Error('offline')},'test-token')).state,'unavailable');
  assert.equal((await resolveEditorialPreview('../unsafe')).state,'invalid');
  assert.equal((await resolveEditorialPreview('')).state,'invalid');
});

test('missing server credential does not mislabel a private branch as missing', async()=>{
  let requested=false;
  const result=await resolveEditorialPreview('cms/story',async()=>{requested=true;throw Error('unexpected')});
  assert.equal(result.state,'unavailable');assert.equal(requested,false);
});

test('a concurrent branch push does not expose the previous successful preview',async()=>{
  let count=0;
  const nextSha='b'.repeat(40);
  const fetcher=async()=>new Response(JSON.stringify(++count===1?{sha}:count===2?{sha,statuses:[status]}:{sha:nextSha}));
  assert.deepEqual(await resolveEditorialPreview('cms/story',fetcher,'test-token'),{state:'pending',sha:nextSha});
});
