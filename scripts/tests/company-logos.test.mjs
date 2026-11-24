import test from 'node:test';
import assert from 'node:assert/strict';
import {
  companyLogoIndex,
  currentCompanyLogo,
  createCompanyLogoLoader,
} from '../../src/lib/server/company-logos.mjs';
const payload = (companies) => ({
  id: 1,
  sponsorship_types: [{ supporting_companies: companies.map((company) => ({ company })) }],
});
const c = {
  id: 1193,
  name: 'Coredge',
  url_segment: 'coredge',
  logo: 'https://images.example/new.png',
};
test('current logo replaces imported logo without changing directory membership', () => {
  const r = {
    name: 'Coredge',
    href: '/community/supporting-organizations/profile/coredge',
    logo: 'https://images.example/old.png',
  };
  assert.equal(currentCompanyLogo(r, companyLogoIndex(payload([c]))), c.logo);
  assert.equal(currentCompanyLogo(r, new Map()), r.logo);
});
test('unsafe URLs and ambiguous names are not applied', () => {
  assert.equal(companyLogoIndex(payload([{ ...c, logo: 'javascript:alert(1)' }])).size, 0);
  const index = companyLogoIndex(payload([c, { ...c, id: 2, url_segment: 'other' }]));
  assert.equal(index.has('name:Coredge'), false);
  assert.equal(index.get('slug:coredge'), c.logo);
});
test('coalesces requests, caches success and keeps last good on failure', async () => {
  let calls = 0,
    time = 0,
    fail = false;
  const load = createCompanyLogoLoader(
    async () => {
      calls++;
      if (fail) throw new Error('outage');
      return Response.json(payload([c]));
    },
    () => time,
  );
  await Promise.all([load(), load()]);
  assert.equal(calls, 1);
  await load();
  assert.equal(calls, 1);
  time = 300001;
  fail = true;
  assert.equal((await load()).get('slug:coredge'), c.logo);
  await load();
  assert.equal(calls, 2);
});
test('cold failure returns empty overrides for snapshot fallback', async () => {
  const load = createCompanyLogoLoader(async () => new Response('', { status: 503 }));
  assert.equal((await load()).size, 0);
});
