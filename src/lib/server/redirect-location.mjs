export function redirectLocation(rule, requestUrl) {
  const request = new URL(requestUrl);
  const destination = new URL(rule.to, request);
  const keys =
    rule.preserveQuery === true
      ? [...new Set(request.searchParams.keys())]
      : Array.isArray(rule.preserveQuery)
        ? rule.preserveQuery
        : [];
  for (const key of keys) {
    if (!request.searchParams.has(key)) continue;
    destination.searchParams.delete(key);
    for (const value of request.searchParams.getAll(key))
      destination.searchParams.append(key, value);
  }
  return rule.to.startsWith('/')
    ? destination.pathname + destination.search + destination.hash
    : destination.href;
}
