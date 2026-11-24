import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareCommunity } from '../../src/lib/server/community.mjs';
import { prepareSupportingOrganizations } from '../../src/lib/server/supporting-organizations.mjs';
const read = (file) =>
  JSON.parse(readFileSync(new URL(`../../src/lib/content/${file}.json`, import.meta.url), 'utf8'));

test('Community accepts Tina identifier aliases and preserves service-owned records', () => {
  const content = read('community');
  const baseline = prepareCommunity(content);
  for (const button of content.contributePanel.navButtons)
    for (const item of button.items)
      for (const option of item.options) {
        option.projects = option.projects.map(({ id }) => ({ projectId: id }));
      }
  for (const group of ['communityManagers', 'ambassadors']) {
    if (!content.helpBanner[group]) continue;
    content.helpBanner[group].list = content.helpBanner[group].list.map(({ user }) => ({
      user: { memberId: user.id },
    }));
  }
  const result = prepareCommunity(content);
  assert.deepEqual(result.helpBanner.groups, baseline.helpBanner.groups);
  assert.deepEqual(
    result.contributePanel.navButtons[0].items[0].options[0].projects,
    baseline.contributePanel.navButtons[0].items[0].options[0].projects,
  );
});

test('Community rejects duplicate, unknown and incomplete selections and unsafe destinations', () => {
  for (const selection of [[{ projectId: 58 }, { projectId: 58 }], [{ projectId: -1 }], [{}]]) {
    const content = read('community');
    content.contributePanel.navButtons[0].items[0].options[0].projects = selection;
    assert.throws(() => prepareCommunity(content));
  }
  const content = read('community');
  content.quickLinks.columns[0].links[0].url = 'javascript:alert(1)';
  assert.throws(() => prepareCommunity(content), /safe HTTP/);
  const member = read('community');
  member.helpBanner.communityManagers.list.push(member.helpBanner.communityManagers.list[0]);
  assert.throws(() => prepareCommunity(member), /duplicates/);
});

test('Community handles cleared repeatable lists without changing committed data', () => {
  const content = read('community');
  content.contributePanel.navButtons = null;
  content.quickLinks.columns = null;
  content.whereToStart.options = null;
  for (const group of Object.values(content.helpBanner)) {
    if (group && typeof group === 'object' && 'list' in group) group.list = null;
  }
  content.communityBanner.list = null;
  const result = prepareCommunity(content);
  assert.deepEqual(result.contributePanel.navButtons, []);
  assert.ok(result.helpBanner.groups.every((group) => group.people.length === 0));
  assert.ok(prepareCommunity(read('community')).contributePanel.navButtons.length);
});

test('Supporting organizations resolves donor aliases and rejects duplicate/unknown ownership selections', () => {
  const content = read('supporting-organizations');
  const baseline = prepareSupportingOrganizations(content);
  content.infrastructureDonors = content.infrastructureDonors.map(({ id }) => ({ companyId: id }));
  assert.deepEqual(prepareSupportingOrganizations(content).sections, baseline.sections);
  content.infrastructureDonors.push(content.infrastructureDonors[0]);
  assert.throws(() => prepareSupportingOrganizations(content), /Duplicate donor/);
  content.infrastructureDonors = [{ companyId: -1 }];
  assert.throws(() => prepareSupportingOrganizations(content), /Unknown donor/);
  content.infrastructureDonors = [];
  content.sections[0].key = 'invented-tier';
  assert.throws(() => prepareSupportingOrganizations(content), /Unknown organization/);
});

test('Community permits removing either optional help group', () => {
  for (const key of ['communityManagers', 'ambassadors']) {
    const content = read('community');
    delete content.helpBanner[key];
    assert.ok(prepareCommunity(content).helpBanner.groups.every((group) => group.key !== key));
  }
});
