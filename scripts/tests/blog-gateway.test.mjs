import assert from 'node:assert/strict';
import test from 'node:test';
import {
  proxyBlog,
  blogRedirect,
  blogCookies,
  isBlogPath,
} from '../../src/lib/server/blog-gateway.mjs';
const env = { BLOG_ACCESS_CLIENT_ID: 'service-id', BLOG_ACCESS_CLIENT_SECRET: 'service-secret' };
const origin = 'https://blog-origin-staging.openstack.org';

test('only the blog namespace is intercepted and its root keeps query parameters', async () => {
  assert.equal(isBlogPath('/blogger'), false);
  assert.equal(await proxyBlog(new Request('https://astro.openstack.org/profile/'), env), null);
  const r = await proxyBlog(new Request('https://astro.openstack.org/blog?s=test'), env);
  assert.equal(r.status, 308);
  assert.equal(r.headers.get('location'), '/blog/?s=test');
});

test('blog proxy strips the prefix, preserves query and isolates credentials', async () => {
  const request = new Request('https://astro.openstack.org/blog/feed/?tag=openstack', {
    headers: {
      Cookie: 'CF_Authorization=private; astro_session=private; wordpress_logged_in_ab=own',
      Authorization: 'Bearer private',
      'CF-Access-Client-Secret': 'spoofed',
    },
  });
  const response = await proxyBlog(request, env, async (url, init) => {
    assert.equal(url.href, origin + '/feed/?tag=openstack');
    assert.equal(init.redirect, 'manual');
    assert.equal(init.headers.get('Authorization'), null);
    assert.equal(init.headers.get('cookie'), 'wordpress_logged_in_ab=own');
    assert.equal(init.headers.get('CF-Access-Client-Secret'), 'service-secret');
    return new Response('<rss/>', {
      headers: { 'Content-Type': 'application/rss+xml', 'Cache-Control': 'public' },
    });
  });
  assert.equal(await response.text(), '<rss/>');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});

test('cross-origin normalized paths never receive service credentials', async () => {
  const r = await proxyBlog(
    new Request('https://astro.openstack.org/blog//attacker.test/path'),
    env,
    () => {
      assert.fail('No external fetch permitted');
    },
  );
  assert.equal(r.status, 400);
});

test('WordPress redirects stay on Astro and origin authentication redirects fail closed', async () => {
  assert.equal(
    blogRedirect('https://www.openstack.org/blog/post/', origin + '/'),
    'https://astro.openstack.org/blog/post/',
  );
  assert.equal(
    blogRedirect('/wp-admin/', origin + '/'),
    'https://astro.openstack.org/blog/wp-admin/',
  );
  assert.throws(() => blogRedirect('javascript:alert(1)', origin));
  let cancelled = false;
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const r = await proxyBlog(
    new Request('https://astro.openstack.org/blog/'),
    env,
    async () =>
      new Response(body, { status: 302, headers: { Location: '/cdn-cgi/access/login/' } }),
  );
  assert.equal(r.status, 502);
  assert.equal(cancelled, true);
});

test('only WordPress response cookies are retained and scoped to the blog', async () => {
  const headers = new Headers();
  headers.append('Set-Cookie', 'CF_Authorization=hidden; Path=/');
  headers.append(
    'Set-Cookie',
    'wordpress_test_cookie=WP; Domain=blog-origin-staging.openstack.org; Path=/; Secure; HttpOnly',
  );
  const response = await proxyBlog(
    new Request('https://astro.openstack.org/blog/wp-login.php'),
    env,
    async () => new Response(null, { headers }),
  );
  assert.deepEqual(response.headers.getSetCookie(), [
    'wordpress_test_cookie=WP; Path=/blog/; Secure; HttpOnly',
  ]);
  assert.equal(
    blogCookies('wordpress_logged_in_ab=x; wp-settings-1=y; other=z'),
    'wordpress_logged_in_ab=x; wp-settings-1=y',
  );
});

test('missing configuration and failed origin requests have no legacy fallback', async () => {
  const request = new Request('https://astro.openstack.org/blog/');
  assert.equal((await proxyBlog(request, {})).status, 502);
  assert.equal(
    (
      await proxyBlog(request, env, async () => {
        throw new Error('offline');
      })
    ).status,
    502,
  );
});
