import test from 'node:test';
import assert from 'node:assert/strict';
import redirects from '../../src/lib/content/redirects.json' with { type: 'json' };
import { redirectLocation } from '../../src/lib/server/redirect-location.mjs';

test('retired event, job and licensing intake routes lead to current resources', () => {
  for (const [from, to] of [
    ['/events/post-an-event/', 'https://openinfra.org/community-events/'],
    ['/community/jobs/post-a-job/', 'https://gitjobs.dev/?foundation=openinfra'],
    ['/brand/logo-request/', '/brand/'],
  ]) {
    const rule = redirects.find((row) => row.from === from);
    assert.equal(rule.to, to);
    assert.equal(rule.status, 301);
    const target = redirectLocation(
      rule,
      new URL(
        'https://astro.openstack.org' +
          from +
          '?Email=synthetic-private&CompanyDetails=synthetic-private',
      ),
    );
    assert.ok(!target.includes('synthetic-private'));
    assert.ok(!target.includes('Email='));
  }
});
