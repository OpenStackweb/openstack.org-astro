import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';

test('Read-only CLI exports a complete candidate without touching site snapshots or retaining secrets', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'astro-software-fixture-'));
  try {
    await mkdir(join(cwd, 'src/lib/software'), { recursive: true });
    await writeFile(join(cwd, 'src/lib/software/catalog.json'), 'original site data');
    const stub = join(cwd, 'request-fixture.mjs');
    await writeFile(stub, `
      const release = { id: 7, name: 'Fixture', status: 'Current', release_date: '2026-01-01' };
      globalThis.fetch = async (url, options) => {
        if (url.hostname === 'identity.example.test') return Response.json({ access_token: 'synthetic-token-secret' });
        if (options.method && options.method !== 'GET') throw Error('Unexpected API mutation');
        if (url.pathname === '/api/v1/releases/7') return Response.json({ sample_configuration_types: [] });
        const rows = {
          '/api/v1/releases': [release],
          '/api/v1/categories': [{ id: 1, slug: 'openstack-components', name: 'Components', parent_category_id: null }],
          '/api/v1/mascots': [],
          '/api/v1/releases/7/components': [{ component: { id: 2, code_name: 'Example', name: 'Fixture', category_id: 1, private_field: 'synthetic-private-field' } }],
        };
        if (!(url.pathname in rows)) throw Error('Unexpected fixture URL');
        return Response.json({ data: rows[url.pathname], current_page: 1, last_page: 1 });
      };
    `);
    const { stdout, stderr } = await promisify(execFile)(process.execPath, [
      '--import', stub, fileURLToPath(new URL('../check-software-api.mjs', import.meta.url)), '--export',
    ], { cwd, timeout: 5000, env: { ...process.env,
      GATSBY_SOFTWARE_API_BASE_URL: 'https://software.example.test',
      IDP_OAUTH2_TOKEN_URL: 'https://identity.example.test/token',
      SOFTWARE_API_OAUTH2_CLIENT_ID: 'synthetic-client', SOFTWARE_API_OAUTH2_CLIENT_SECRET: 'synthetic-client-secret',
      SOFTWARE_API_OAUTH2_SCOPES: 'read', GATSBY_LEGACY_SOFTWARE_BASE_URL: '/',
    } });
    const report = JSON.parse(stdout);
    assert.equal(report.websiteChanged, false);
    assert.equal(stderr, '');
    assert.equal(await readFile(join(cwd, 'src/lib/software/catalog.json'), 'utf8'), 'original site data');
    const manifest = JSON.parse(await readFile(join(cwd, report.candidateDirectory, 'manifest.json'), 'utf8'));
    assert.equal(manifest.complete, true);
    assert.equal(manifest.files.length, 4);
    for (const file of manifest.files) {
      const body = await readFile(join(cwd, report.candidateDirectory, file.name));
      assert.equal(body.length, file.bytes);
      assert.equal(createHash('sha256').update(body).digest('hex'), file.sha256);
      assert.doesNotMatch(body.toString(), /synthetic-(?:token-secret|client-secret|private-field)/);
    }
    assert.doesNotMatch(stdout + stderr, /synthetic-(?:token-secret|client-secret|private-field)/);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});
