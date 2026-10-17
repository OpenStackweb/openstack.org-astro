import test from 'node:test';
import assert from 'node:assert/strict';
import routes from '../../src/lib/content/legacy-video-redirects.json' with { type: 'json' };
import { legacyVideoDestination } from '../../src/lib/server/legacy-video-redirect.mjs';
import { execFile, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

test('every retained source route redirects to its exact ID with either trailing-slash spelling', () => {
  assert.ok(Object.keys(routes).length > 4000);
  for (const [path, id] of Object.entries(routes)) {
    assert.match(path, /^\/videos\/summits\/[^/]+\/[^/]+$/);
    assert.match(id, /^[A-Za-z0-9_-]{11}$/);
    assert.equal(new URL(path, 'https://www.openstack.org').pathname, path);
    assert.equal(legacyVideoDestination(path), `https://www.youtube.com/watch?v=${id}`);
    assert.equal(legacyVideoDestination(path + '/'), legacyVideoDestination(path));
  }
});

const checker=fileURLToPath(new URL('../check-legacy-video-redirects.mjs',import.meta.url));
test('HTTP acceptance operator rejects nonlocal, credentialed and path-bearing targets',()=>{
  for(const base of ['https://www.openstack.org','http://example.org:4421','http://synthetic:synthetic@127.0.0.1:4421','http://127.0.0.1:4421/proxy/']) {
    const result=spawnSync(process.execPath,[checker,base],{encoding:'utf8',timeout:5000});
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/Pass an explicit local HTTP Worker origin and port/);
    assert.equal(result.stdout,'');
  }
});

test('HTTP acceptance operator checks root identity before any legacy detail request',async()=>{
  const requests=[];
  let headers={};
  const server=createServer((request,response)=>{
    requests.push(request.method+' '+request.url);
    response.writeHead(200,headers);response.end();
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    for(const current of [{},{'X-Framework-Comparison':'astro','X-Beta-Legacy-Proxy':'enabled'}]) {
      headers=current;
      await assert.rejects(promisify(execFile)(process.execPath,[checker,`http://127.0.0.1:${server.address().port}`],{timeout:5000}),error=>{
        assert.match(error.stderr,/Target must be the isolated Astro Worker with legacy proxy disabled/);
        return true;
      });
    }
    assert.deepEqual(requests,['HEAD /','HEAD /']);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});

test('root, catalogue, ambiguous and unknown paths do not become guessed redirects', () => {
  for (const path of ['/videos/', '/videos/summits/virtual/', '/videos/summits/virtual/Zuul-at-Volvo-Cars-Corporation',
    '/videos/summits/virtual/Cisco-5G-Automated-Deployment', '/videos/summits/vancouver-2015/dell-and-red-hat-taking-openstack-to-the-enterprise-2',
    '/videos/summits/unknown/missing', '/__proto__', '/constructor']) {
    assert.equal(legacyVideoDestination(path), null);
  }
});
