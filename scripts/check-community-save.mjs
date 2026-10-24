// Local Tina filesystem acceptance only. Restores both files byte-for-byte.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const endpoint = 'http://localhost:4001/graphql';
const lock = JSON.parse(readFileSync('tina/tina-lock.json', 'utf8'));
const files = ['community', 'supporting-organizations'];
const backups = new Map(
  files.map((name) => [name, readFileSync(`src/lib/content/${name}.json`, 'utf8')]),
);
function input(value, fields) {
  return Object.fromEntries(
    fields
      .filter((f) => f.type !== 'displayOnly')
      .flatMap((field) => {
        const stored = field.nameOverride || field.name;
        if (!(stored in value)) return [];
        const item = value[stored];
        return [
          [
            field.name,
            field.type === 'object' && item != null
              ? field.list
                ? item.map((v) => input(v, field.fields))
                : input(item, field.fields)
              : item,
          ],
        ];
      }),
  );
}
async function save(name, type, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `mutation($params:${type}Mutation!){update${type}(relativePath:"${name}.json",params:$params){_sys{filename}}}`,
      variables: { params },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  assert.equal(result.errors, undefined, JSON.stringify(result.errors));
  return JSON.parse(readFileSync(`src/lib/content/${name}.json`, 'utf8'));
}
try {
  for (const [name, collection, type] of [
    ['community', 'community', 'Community'],
    ['supporting-organizations', 'supportingOrganizations', 'SupportingOrganizations'],
  ]) {
    const original = JSON.parse(backups.get(name));
    const fields = lock.schema.collections.find((c) => c.name === collection).fields;
    const draft = input(original, fields);
    if (name === 'community') {
      draft.quickLinks.columns.reverse();
      draft.quickLinks.columns[0].links.push({
        title: 'Local save acceptance',
        url: 'https://example.org/',
      });
      const saved = await save(name, type, draft);
      assert.deepEqual(
        input(saved, fields),
        draft,
        'All editable fields and alias references survive an actual Tina save',
      );
      assert.ok(
        saved.helpBanner.communityManagers.list.every(
          (item) => Number.isInteger(item.user.id) && !('memberId' in item.user),
        ),
      );
      draft.quickLinks.columns[0].links.pop();
      draft.helpBanner.ambassadors.list.reverse();
      const removed = await save(name, type, draft);
      assert.deepEqual(input(removed, fields), draft, 'Removal and member reorder persist');
    } else {
      draft.sections.reverse();
      draft.sections[0].description += '\nLocal save acceptance.';
      draft.infrastructureDonors.reverse();
      const saved = await save(name, type, draft);
      assert.deepEqual(input(saved, fields), draft);
      assert.ok(
        saved.infrastructureDonors.every(
          (item) => Number.isInteger(item.id) && !('companyId' in item),
        ),
      );
      draft.infrastructureDonors.pop();
      const removed = await save(name, type, draft);
      assert.deepEqual(input(removed, fields), draft, 'Donor removal persists');
    }
  }
  console.log(
    'Local Tina saves: both collections, add/reorder/remove, all fields and original numeric ID storage passed.',
  );
} finally {
  for (const [name, bytes] of backups) writeFileSync(`src/lib/content/${name}.json`, bytes);
}
