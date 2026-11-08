// Keep public/_headers in sync: static assets can bypass the Worker.
// No includeSubDomains/preload: legacy subdomains have independent HTTPS owners.
// This baseline deliberately does not restrict scripts or external embeds.
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Content-Security-Policy':
    "base-uri 'self'; object-src 'none'; frame-ancestors 'self' https://openstack.org https://www.openstack.org https://astro.openstack.org",
};

export function secureResponse(response) {
  // Fetch responses (including the blog proxy) may have immutable headers.
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) {
    // Preserve independent applications' stricter policies. CSP policies intersect.
    if (name === 'Content-Security-Policy' && secured.headers.has(name)) {
      secured.headers.append(name, value);
    } else if (!secured.headers.has(name)) {
      secured.headers.set(name, value);
    }
  }
  return secured;
}
