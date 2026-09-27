import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

for (const scenario of ['changed', 'unchanged', 'failure', 'pending']) {
  test(`refresh CLI ${scenario}: isolated Git and synthetic service only`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'software-refresh-test-'));
    const cwd = join(root, 'work');
    await mkdir(join(cwd, 'src/lib/software'), { recursive: true });
    const git = (...args) =>
      execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
    try {
      git('init', '-b', 'main');
      git('config', 'user.name', 'Test');
      git('config', 'user.email', 'test@example.test');
      git('config', 'commit.gpgsign', 'false');
      git('init', '--bare', join(root, 'remote.git'));
      git('remote', 'add', 'origin', join(root, 'remote.git'));
      const previous = {
        'catalog.json': [],
        'catalog-release.json': { name: 'Old' },
        'sample-configurations.json': { types: [] },
        'release-history.json': [],
      };
      for (const [name, value] of Object.entries(previous))
        await writeFile(join(cwd, 'src/lib/software', name), JSON.stringify(value));
      await writeFile(join(cwd, 'editorial.txt'), 'unchanged');
      git('add', '.');
      git('commit', '-m', 'Fixture');
      git('push', 'origin', 'main');
      const head = git('rev-parse', 'HEAD');
      const stub = join(root, 'fixture.mjs');
      await writeFile(
        stub,
        `
        import {appendFileSync} from 'node:fs';
        const release={id:7,name:'Fixture',status:'Current',release_date:'2026-01-01'};
        globalThis.fetch=async (input, init={})=>{
          const url=new URL(input);
          if(url.hostname==='api.github.com'){
            appendFileSync(${JSON.stringify(join(root, 'calls.jsonl'))},JSON.stringify({path:url.pathname,method:init.method,body:init.body})+'\\n');
            if(url.pathname.endsWith('/pulls') && init.method==='GET') return Response.json(${scenario === 'pending' ? "[{number:1,html_url:'https://github.com/example/pull/1',head:{ref:'software-refresh/old',repo:{full_name:'OpenStackweb/openstack.org-astro'}}}]" : '[]'});
            if(url.pathname.endsWith('/git/ref/heads/main')) return Response.json({object:{sha:${JSON.stringify(head)}}});
            if(url.pathname.endsWith('/pulls') && init.method==='POST') return Response.json({number:2,html_url:'https://github.com/example/pull/2'});
            if(url.pathname.endsWith('/dispatches')) return new Response(null,{status:204});
            throw Error('Unexpected GitHub request');
          }
          if(${JSON.stringify(scenario)}==='failure') return new Response('synthetic-private-error',{status:503});
          if(url.hostname==='identity.example.test') return Response.json({access_token:'synthetic-secret'});
          if(init.method && init.method!=='GET') throw Error('Unexpected service mutation');
          if(url.pathname==='/api/v1/releases/7') return Response.json({sample_configuration_types:[]});
          const rows={
            '/api/v1/releases':[release],
            '/api/v1/categories':[{id:1,slug:'openstack-components',name:'Components',parent_category_id:null}],
            '/api/v1/mascots':[],
            '/api/v1/releases/7/components':[{component:{id:2,code_name:'Example',name:'Fixture',category_id:1,private_field:'synthetic-private'}}],
          };
          if(!(url.pathname in rows)) throw Error('Unexpected service path');
          return Response.json({data:rows[url.pathname],current_page:1,last_page:1});
        };
      `,
      );
      const env = {
        ...process.env,
        GH_TOKEN: 'synthetic-secret',
        GITHUB_REPOSITORY: 'OpenStackweb/openstack.org-astro',
        GITHUB_REF: 'refs/heads/main',
        GITHUB_RUN_ID: '123',
        GITHUB_RUN_ATTEMPT: '1',
        GITHUB_STEP_SUMMARY: join(root, 'summary.md'),
        GATSBY_SOFTWARE_API_BASE_URL: 'https://software.example.test',
        IDP_OAUTH2_TOKEN_URL: 'https://identity.example.test/token',
        SOFTWARE_API_OAUTH2_CLIENT_ID: 'test',
        SOFTWARE_API_OAUTH2_CLIENT_SECRET: 'synthetic-secret',
        SOFTWARE_API_OAUTH2_SCOPES: 'read',
        GATSBY_LEGACY_SOFTWARE_BASE_URL: '/',
      };
      const command = fileURLToPath(new URL('../refresh-software-catalogue.mjs', import.meta.url));
      const run = () =>
        execFileSync(process.execPath, ['--import', stub, command], {
          cwd,
          env,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
      if (scenario === 'failure') {
        assert.throws(run, (e) => {
          assert.doesNotMatch(e.stderr, /synthetic-private-error|synthetic-secret/);
          return true;
        });
        assert.equal(git('rev-parse', 'HEAD'), head);
      } else {
        run();
        if (scenario === 'changed' || scenario === 'unchanged') {
          assert.equal(git('rev-parse', 'origin/main'), head);
          assert.equal(await readFile(join(cwd, 'editorial.txt'), 'utf8'), 'unchanged');
          const paths = git('diff', '--name-only', head, 'HEAD').split('\n');
          assert.equal(paths.length, 5);
          assert.ok(paths.every((path) => path.startsWith('src/lib/software/')));
          const calls = (await readFile(join(root, 'calls.jsonl'), 'utf8'))
            .trim()
            .split('\n')
            .map(JSON.parse);
          assert.equal(calls.filter((c) => c.path.endsWith('/dispatches')).length, 1);
          assert.equal(
            calls.filter((c) => c.path.endsWith('/pulls') && c.method === 'POST').length,
            1,
          );
          if (scenario === 'unchanged') {
            git('checkout', 'main');
            git('merge', '--ff-only', 'software-refresh/123-1');
            await writeFile(join(root, 'calls.jsonl'), '');
            run();
            const second = await readFile(join(root, 'calls.jsonl'), 'utf8');
            assert.doesNotMatch(second, /dispatches|"method":"POST"/);
            assert.match(await readFile(join(root, 'summary.md'), 'utf8'), /No data changes/);
          }
        } else assert.equal(git('rev-parse', 'HEAD'), head);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}
