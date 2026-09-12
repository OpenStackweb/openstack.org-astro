import redirects from '../content/redirects.json' with { type: 'json' };

export function editorialRedirectFor(path, hostname) {
  const rule = redirects.find((rule) => rule.from === (path.endsWith('/') ? path : `${path}/`));
  if (rule?.previewOnly && !['beta.openstack.org', 'localhost', '127.0.0.1'].includes(hostname))
    return undefined;
  return rule;
}
