// Reconcile SELECT-only public company fields with a read-only production DOM capture.
// This freezes approved historical listings; it never edits the company service.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const directory = process.argv[2];
assert.ok(directory, 'Provide the private source-export directory');
const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const rows = await read(`${directory}/sponsor-relational-source.json`);
const published = await read(`${directory}/sponsor-relational-public-complete.json`);
const assets = await read(`${directory}/sponsor-relational-media/manifest.json`);
const registry = await read('src/lib/content/media.json');
const paths = await read('src/lib/content/editorial-paths.json');
const events = {
  'openstack-paris-summit-2014': 'Paris 2014',
  'openstack-summit-atlanta-2014': 'Atlanta 2014',
  'openstack-summit-hong-kong-2013': 'Hong Kong 2013',
  'vancouver-2015': 'Vancouver 2015',
};
const tiers = {
  'Headline Sponsors': 'Headline',
  'Premier Sponsors': 'Premier',
  'Spotlight Sponsors': 'Spotlight',
  'Event Sponsors': 'Event',
  'Startup Sponsors': 'Startup',
  'Community Partners': 'InKind',
};
assert.equal(published.length, 4);
const evidence = [];
for (const page of published) {
  const event = page.path.split('/')[2];
  assert.ok(events[event]);
  const matched = rows.filter((row) => `/summit/${row.parent}/${row.slug}/` === page.path);
  assert.ok(matched.length);
  assert.ok(matched.every((row) => ['Anyone', 'Inherit'].includes(row.view)));
  let count = 0;
  const groups = page.groups.map((group) => {
    const source = matched.filter((row) => row.tier === tiers[group.title]);
    assert.equal(source.length, group.items.length);
    return {
      title: group.title,
      columns: 3,
      sponsors: group.items.map((item, index) => {
        const row = source[index];
        assert.equal(item.href || '', row.href || '');
        if (item.alt) assert.equal(item.alt, `${row.name}_big_logo`);
        let image = '';
        if (item.src) {
          const asset = assets.find((asset) => asset.url === item.src);
          assert.ok(asset);
          if (asset.status === 'unavailable') {
            // A broken generated thumbnail may have a previously migrated original.
            const key = `assets/summit-sponsor-archive/${row.logo.replace(/^assets\//, '')}`;
            assert.ok(registry[key], `Missing original logo: ${row.name}`);
            image = `/${key}`;
          } else {
            if (!registry[asset.key])
              registry[asset.key] = {
                bytes: asset.bytes,
                contentType: asset.contentType,
                sha256: asset.sha256,
              };
            image = `/${asset.key}`;
          }
        }
        count++;
        const rawUrl = (row.href || '').trim();
        // Legacy bare www hostnames otherwise resolve beneath the Summit path.
        const url = /^www\.[a-z0-9.-]+(?:\/|$)/i.test(rawUrl) ? `https://${rawUrl}` : rawUrl;
        return { name: row.name, url, image };
      }),
    };
  });
  assert.equal(count, matched.length, 'Do not silently omit a sponsor tier');
  const filename = `${event}-${page.path.split('/').filter(Boolean).at(-1)}.json`;
  const content = {
    title: 'Thank You To The OpenStack Summit Sponsors',
    seoTitle: `OpenStack ${events[event]} Summit — Historical Sponsor Listing`,
    path: page.path,
    description: `Archived sponsor tiers and companies from the ${events[event]} OpenStack Summit, preserving the published event listing.`,
    archiveEvent: event,
    archiveNotice: `Historical sponsor archive — ${events[event]}. Listings reflect the published archive reviewed in September 2026; company logos and destinations may have changed since the event. This is not current sponsorship information.`,
    body: '<p>Thank you to the companies and community partners who supported this historical OpenStack Summit. Sponsors whose archived logos are unavailable are listed by name.</p>',
    sponsors: { groups },
  };
  await writeFile(`src/lib/content/pages/${filename}`, JSON.stringify(content, null, 2) + '\n');
  if (!paths.includes(page.path)) paths.push(page.path);
  evidence.push({
    path: page.path,
    filename,
    entries: count,
    logos: groups.flatMap((g) => g.sponsors).filter((s) => s.image).length,
    groups: groups.map((g) => ({ title: g.title, count: g.sponsors.length })),
  });
}
await writeFile('src/lib/content/media.json', JSON.stringify(registry, null, 2) + '\n');
await writeFile('src/lib/content/editorial-paths.json', JSON.stringify(paths, null, 2) + '\n');
await writeFile(
  'docs/historical-sponsor-coverage.json',
  JSON.stringify(
    {
      reviewed: '2026-09-15',
      sourceRevision: '2172298743fe807a92758cf307059b69a7dba668',
      scope:
        'Ordered published listings reconciled with public-facing fields from local SilverStripe relationships. Git-managed historical snapshots; no live sponsorship administration.',
      pages: evidence,
    },
    null,
    2,
  ) + '\n',
);
console.log(evidence.map(({ path, entries, logos }) => ({ path, entries, logos })));
