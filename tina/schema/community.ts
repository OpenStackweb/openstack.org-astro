import type { Collection, TinaField } from 'tinacms';
import { ProjectSelectionField, MemberSelectionField, DonorSelectionField } from '../CommunitySelectionField';
import { prepareCommunity } from '../../src/lib/server/community.mjs';
import { prepareSupportingOrganizations } from '../../src/lib/server/supporting-organizations.mjs';
import projects from '../../src/lib/community/projects.json';
import members from '../../src/lib/community/members.json';
import organizations from '../../src/lib/companies/supporting-organizations.json';

const text = (name: string, label: string, required = false, multiline = false): TinaField => ({
  type: 'string', name, label, required, ...(multiline ? { ui: { component: 'textarea' } } : {}),
});
const object = (name: string, label: string, fields: TinaField[], list = false): TinaField => ({
  type: 'object', name, label, fields, ...(list ? { list: true, ui: { itemProps: item => ({ label: item.title || item.name || item.text || 'New item' }) } } : {}),
});
const link = (label: 'title' | 'text' = 'title') => [text(label, 'Link text', true), text('url', 'Destination', true)];
const banner = () => [text('title', 'Heading', true), text('description', 'Introduction (HTML or Markdown)', false, true), { type: 'image', name: 'backgroundImage', label: 'Background image', required: true } satisfies TinaField];
const idField = (name: string, label: string, component: any): TinaField => ({ type: 'number', name, nameOverride: 'id', label, required: true, ui: { component } });
const projectSelections = object('projects', 'Selected projects', [idField('projectId', 'Project', ProjectSelectionField)], true);
projectSelections.ui = { ...projectSelections.ui, itemProps: item => ({ label: projects.find(p => p.id === (item.projectId ?? item.id))?.code_name || 'Choose a project' }) };
const memberGroup = (name: string, label: string): TinaField => object(name, label, [
  text('title', 'Group heading', true),
  { type: 'object', name: 'list', label: 'Selected people', list: true,
    ui: { itemProps: item => { const p = members.find(p => p.id === (item.user?.memberId ?? item.user?.id)); return { label: p ? `${p.first_name} ${p.last_name}` : 'Choose a member' }; } },
    fields: [object('user', 'Member', [idField('memberId', 'Member', MemberSelectionField)])] },
]);

export const community = {
  name: 'community', label: 'Community — Contributor Portal', path: 'src/lib/content', match: { include: 'community' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/community/', beforeSubmit: async ({ values }) => { prepareCommunity(values); return values; } },
  fields: [
    text('pageTitle', 'Search and browser title', true), text('description', 'Search and sharing description', false, true),
    object('topBanner', 'Welcome banner', banner()),
    object('contributePanel', 'Ways to contribute', [text('title', 'Heading', true),
      object('navButtons', 'Contribution choices', [text('title', 'Label', true), { type: 'image', name: 'image', label: 'Icon', required: true }, text('imageAlt', 'Icon description'),
        text('externalURL', 'Direct link (leave empty to show a panel)'),
        { type: 'string', name: 'component', label: 'Panel type', options: [{ label: 'Resource links', value: '' }, { label: 'Project groups', value: 'CodeAndDocumentation' }] },
        object('items', 'Panel groups', [text('title', 'Heading (HTML or Markdown)', true, true), text('tooltip', 'Help text', false, true),
          { ...text('component', 'Legacy group type'), ui: { component: null } },
          object('options', 'Options', [text('name', 'Label', true), text('text', 'Description', false, true), text('url', 'Destination (resource links only)'), projectSelections], true),
        ], true),
      ], true),
    ]),
    object('quickLinks', 'Contributor resources', [text('pretitle', 'Eyebrow'), text('title', 'Heading', true), object('columns', 'Resource groups', [text('title', 'Heading', true), object('links', 'Links', link(), true)], true)]),
    object('whereToStart', 'Getting involved', [...banner(), object('options', 'Links', link('text'), true)]),
    object('helpBanner', 'Community help', [text('title', 'Heading', true), text('description', 'Introduction (HTML or Markdown)', false, true), memberGroup('communityManagers', 'Community managers'), memberGroup('ambassadors', 'Ambassadors')]),
    object('communityBanner', 'Communication', [...banner(), text('backgroundImageAlt', 'Image description'), object('list', 'Communication groups', [text('title', 'Heading', true), object('links', 'Links', link('text'), true)], true)]),
    object('labels', 'Interface labels', ['selectedGroup', 'selectAnother', 'selectProject', 'projectIntroduction', 'emptyProjects', 'profile', 'x', 'linkedIn'].map(name => text(name, name, false, name === 'projectIntroduction'))),
  ],
} satisfies Collection;

export const supportingOrganizations = {
  name: 'supportingOrganizations', label: 'Community — Supporting Organizations', path: 'src/lib/content', match: { include: 'supporting-organizations' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/community/supporting-organizations/', beforeSubmit: async ({ values }) => { prepareSupportingOrganizations(values); return values; } },
  fields: [text('pageTitle', 'Search and browser title', true), text('title', 'Page heading', true), text('description', 'Search and sharing description', false, true), text('introduction', 'Introduction (HTML or Markdown)', false, true),
    object('sections', 'Membership sections', [
      { type: 'string', name: 'key', label: 'Service membership category', required: true, options: [{ label: 'Platinum', value: 'platinum' }, { label: 'Gold', value: 'gold' }, { label: 'Silver', value: 'silver' }, { label: 'Infrastructure donors', value: 'infraDonors' }, { label: 'Supporting organizations', value: 'supporting' }] },
      text('title', 'Heading', true), text('description', 'Introduction (HTML or Markdown)', false, true),
    ], true),
    { type: 'object', name: 'infrastructureDonors', label: 'Selected infrastructure donors', list: true,
      ui: { itemProps: item => ({ label: organizations.donors.find(p => p.id === (item.companyId ?? item.id))?.name || 'Choose a donor' }) },
      fields: [idField('companyId', 'Donor', DonorSelectionField)] },
  ],
} satisfies Collection;
