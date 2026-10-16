import test from 'node:test';
import assert from 'node:assert/strict';
import { forwardSurvey, MOUNT } from '../../src/lib/survey/gateway.mjs';
const env = {SURVEY_SERVICE_ORIGIN:'https://survey-staging.openstack.org',SURVEY_ACCESS_CLIENT_ID:'synthetic-id',SURVEY_ACCESS_CLIENT_SECRET:'synthetic-secret'};
const request = (path,options={})=>new Request('https://astro.openstack.org'+MOUNT+path,options);
test('gateway denies staff endpoints, traversal, arbitrary origins and missing service credentials',async()=>{
  let called=false; const fetcher=()=>{called=true;throw Error('must not fetch');};
  for (const path of ['/admin/','/api/v1/history/responses','/api/v1/surveys','/static/%2e%2e/private','/static/a/../..%2fprivate','/auth/local']) {
    assert.equal((await forwardSurvey(request(path),env,{fetcher})).status,404,path);
  }
  assert.equal((await forwardSurvey(request('/api/session'),{...env,SURVEY_SERVICE_ORIGIN:'https://evil.example'}, {fetcher})).status,503);
  assert.equal((await forwardSurvey(request('/api/session'),{SURVEY_SERVICE_ORIGIN:env.SURVEY_SERVICE_ORIGIN},{fetcher})).status,503);
  assert.equal(called,false);
});
test('gateway forwards only Survey credentials and narrows returned cookie paths',async()=>{
  const result=await forwardSurvey(request('/api/session',{headers:{Cookie:'CF_Authorization=outer; openinfra_survey_session=own; other=private',Authorization:'Bearer unrelated','CF-Access-Client-Secret':'spoof'}}),env,{fetcher:async(url,options)=>{
    assert.equal(url.href,'https://survey-staging.openstack.org/api/session');
    assert.equal(options.headers.get('Cookie'),'openinfra_survey_session=own');
    assert.equal(options.headers.get('Authorization'),null);
    assert.equal(options.headers.get('CF-Access-Client-Secret'),'synthetic-secret');
    const headers=new Headers({'Content-Type':'application/json'});
    headers.append('Set-Cookie','openinfra_survey_csrf=value; Path=/; Secure; SameSite=Lax');
    headers.append('Set-Cookie','CF_Authorization=not-for-browser; Path=/');
    return new Response('{}',{headers});
  }});
  assert.match(result.headers.get('Cache-Control'),/no-store/);
  assert.deepEqual(result.headers.getSetCookie(),['openinfra_survey_csrf=value; Secure; SameSite=Lax; Path=/user-survey/']);
});
test('writes require same-origin header and retain CSRF token and revision body',async()=>{
  for (const Origin of [null,'https://other.openstack.org']) {
    const headers=Origin?{Origin}:{};
    assert.equal((await forwardSurvey(request('/api/v1/responses/1',{method:'PUT',headers,body:'{}'}),env)).status,403);
  }
  const response=await forwardSurvey(request('/api/v1/responses/1',{method:'PUT',headers:{Origin:'https://astro.openstack.org','Content-Type':'application/json','X-CSRFToken':'synthetic'},body:'{"revision":4}'}),env,{fetcher:async(url,options)=>{
    assert.equal(options.headers.get('Origin'),'https://astro.openstack.org');
    assert.equal(options.headers.get('X-CSRFToken'),'synthetic');
    assert.equal(new TextDecoder().decode(options.body),'{"revision":4}');
    return Response.json({revision:5});
  }});
  assert.equal(response.status,200);
});
test('unexpected auth redirects fail closed, callback redirects to survey and outages are generic',async()=>{
  const redirect=location=>async()=>new Response(null,{status:302,headers:{Location:location}});
  const r=await forwardSurvey(request('/auth/callback?code=synthetic'),env,{fetcher:redirect('/')});
  assert.equal(r.headers.get('Location'),'/user-survey/');
  const auth=await forwardSurvey(request('/auth/login'),env,{fetcher:redirect('https://id.openinfra.dev/oauth2/auth?state=synthetic')});
  assert.match(auth.headers.get('Location'),/^https:\/\/id.openinfra.dev/);
  assert.equal((await forwardSurvey(request('/api/session'),env,{fetcher:redirect('https://evil.example/')})).status,502);
  assert.equal((await forwardSurvey(request('/api/session'),env,{fetcher:async()=>{throw Error('private details');}})).status,502);
});

test('oversized bodies are rejected before reaching the service',async()=>{
  let called=false;
  const result=await forwardSurvey(request('/api/v1/responses/1',{method:'PUT',headers:{Origin:'https://astro.openstack.org'},body:'x'.repeat(300001)}),env,{fetcher:async()=>{called=true;}});
  assert.equal(result.status,413);assert.equal(called,false);
});
