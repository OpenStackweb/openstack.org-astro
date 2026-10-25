/** Parse our same-origin CMS endpoints without exposing an HTML error/login page. */
export async function cmsResponse(response, fallback) {
  const contentType = response.headers.get('content-type') || '';
  if (!/^application\/(?:[\w.-]+\+)?json\b/i.test(contentType)) {
    throw new Error(
      'The website returned a sign-in or error page. Open the review site in a new tab, sign in if prompted, then retry here.',
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The website returned an unreadable response. Please retry.');
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403)
      throw new Error(
        'This CMS request is not authorized. Check your review-site and Tina sign-in, then retry.',
      );
    throw new Error(typeof data?.error === 'string' && data.error.trim() ? data.error : fallback);
  }
  return data;
}
