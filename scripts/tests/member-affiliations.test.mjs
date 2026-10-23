import test from 'node:test';
import assert from 'node:assert/strict';
import {
  requestAffiliations,
  affiliationPayload,
  localToday,
} from '../../src/lib/auth/affiliations.mjs';
function fixture() {
  let epoch = 'a',
    token = 'synthetic';
  return {
    session: { epoch: () => epoch, current: () => ({ accessToken: token }) },
    accessToken: async () => token,
    clearSession: () => {
      epoch = 'b';
      token = 'new';
    },
    switchIdentity: () => {
      epoch = 'b';
      token = 'other';
    },
  };
}
test('affiliations only use member-owned paths, scoped token and fixed independent host', async () => {
  const auth = fixture();
  const calls = [];
  const result = await requestAffiliations({
    ...auth,
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return Response.json({
        total: 1,
        data: [
          {
            id: 2,
            organization: { name: 'Synthetic' },
            job_title: 'Role',
            is_current: true,
            start_date: 123,
            groups: ['private'],
          },
        ],
      });
    },
  });
  assert.deepEqual(
    Object.keys(result[0]).sort(),
    ['id', 'organization', 'job_title', 'is_current', 'start_date', 'end_date'].sort(),
  );
  assert.equal(
    calls[0].url,
    'https://oifapi.openinfra.dev/api/v1/members/me/affiliations?expand=organization',
  );
  assert.equal(calls[0].options.redirect, 'manual');
  assert.equal(calls[0].options.cache, 'no-store');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer synthetic');
});
test('an account switch rejects stale success and cannot clear the newer login', async () => {
  const auth = fixture();
  for (const status of [200, 401]) {
    const current = fixture();
    let cleared = false;
    await assert.rejects(
      requestAffiliations({
        ...current,
        clearSession: () => {
          cleared = true;
        },
        fetcher: async () => {
          current.switchIdentity();
          return new Response('{}', { status });
        },
      }),
      /session changed/,
    );
    assert.equal(cleared, false);
  }
  await assert.rejects(
    requestAffiliations({ ...auth, fetcher: async () => Response.json({ total: 2, data: [] }) }),
    /completely/,
  );
});
test('current and historical form payloads validate date order and omit a current end date', () => {
  const form = new FormData();
  form.set('organization', ' Synthetic ');
  form.set('job_title', ' Role ');
  form.set('start_date', '2026-01-01');
  form.set('is_current', 'on');
  form.set('end_date', '2025-01-01');
  const current = affiliationPayload(form);
  assert.equal(current.organization_name, 'Synthetic');
  assert.equal(current.job_title, 'Role');
  assert.equal('end_date' in current, false);
  form.delete('is_current');
  assert.throws(() => affiliationPayload(form), /after/);
  form.set('end_date', '2026-03-01');
  assert.equal(affiliationPayload(form).is_current, false);
  form.set('start_date', '2026-02-30');
  assert.throws(() => affiliationPayload(form), /valid date/);
});
test('mutation path rejects supplied member IDs and invalid affiliation IDs', async () => {
  const auth = fixture();
  for (const id of [undefined, -1, '2', NaN])
    await assert.rejects(requestAffiliations({ ...auth, method: 'DELETE', id }), /Invalid/);
  await assert.rejects(requestAffiliations({ ...auth, method: 'GET', id: 2 }), /Invalid/);
});

test('the default start date uses the local calendar day rather than the UTC day', () => {
  assert.equal(localToday(new Date(2026, 9, 22, 23, 59)), '2026-10-22');
});
