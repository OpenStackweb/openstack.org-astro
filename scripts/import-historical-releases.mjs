// Input is the private SELECT-only export of seven published SilverStripe pages.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { parseDocument, DomUtils as D } from 'htmlparser2';
const expected = ['essex', 'folsom', 'grizzly', 'havana', 'icehouse', 'juno', 'kilo'];
const rows = JSON.parse(await readFile(process.argv[2], 'utf8'));
assert.deepEqual(rows.map((row) => row.slug).sort(), [...expected].sort());
for (const row of rows) {
  assert.ok(['Inherit', 'Anyone'].includes(row.view));
  const document = parseDocument(row.body);
  const elements = D.findAll(() => true, document.children);
  assert.ok(
    !elements.some((node) =>
      ['form', 'script', 'iframe', 'object', 'embed', 'pre'].includes(node.name),
    ),
  );
  for (const node of elements) {
    for (const key of ['href', 'src']) {
      const raw = node.attribs[key];
      if (!raw || raw.startsWith('#')) continue;
      assert.doesNotMatch(raw, /access_token=|client_secret=|[?&](?:key|token|password)=/i);
      const url = new URL(raw, 'https://www.openstack.org/');
      assert.ok(['http:', 'https:', 'mailto:'].includes(url.protocol));
      node.attribs[key] = ['www.openstack.org', 'openstack.org'].includes(url.hostname)
        ? url.pathname + url.search + url.hash
        : url.href;
    }
    if (node.name === 'h1') node.name = 'h2';
  }
  const name = row.slug[0].toUpperCase() + row.slug.slice(1);
  const content = {
    title: `OpenStack ${name} — Historical Release`,
    path: `/software/${row.slug}/`,
    description: `Archived OpenStack ${name} release overview, features, dashboard screenshots and contributor acknowledgments, recovered from published SilverStripe content.`,
    archiveNotice:
      'Historical release documentation. Features, links, downloads and contributor affiliations describe this release at publication; they are not current installation or support guidance. This archive is separate from the development software catalogue.',
    body: D.getInnerHTML(document)
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim(),
  };
  await writeFile(
    `src/lib/content/software-archives/${row.slug}.json`,
    JSON.stringify(content, null, 2) + '\n',
  );
}
console.log(`Imported ${rows.length} historical editorial releases`);
