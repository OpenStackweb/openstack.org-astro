import type { Collection, TinaField } from 'tinacms';
import { ai } from './ai';
import companies from '../../src/lib/companies/vmware-members.json';
import { VmwareCompanySelectionField } from '../CompanySelectionField';
import { validateVmwareCompanies, validateVmwareSubmission } from '../vmware-validation.mjs';
const text = (name: string, label: string, multiline = false): TinaField => ({ type: 'string', name, label, ...(multiline ? { ui: { component: 'textarea' } } : {}) });
const image = (name: string, label: string): TinaField => ({ type: 'image', name, label });
const object = (name: string, label: string, fields: TinaField[]): TinaField => ({ type: 'object', name, label, fields });
const button = (name: string, label: string) => object(name, label, [text('title', 'Button text'), text('url', 'Destination')]);
const metric = (name: string, label: string) => object(name, label, [
  { type: 'number', name: 'percentage', label: 'Percentage', required: true,
    ui: { validate: value => typeof value === 'number' && value >= 0 && value <= 100 ? undefined : 'Use a percentage between 0 and 100.' } },
  text('abstract', 'Metric description and attribution (HTML or Markdown)', true),
]);
export const vmware: Collection = {
  name: 'vmware', label: 'VMware migration to OpenStack', path: 'src/lib/content', match: { include: 'vmware-migration' }, format: 'json',
  ui: { allowedActions: { create: false, delete: false }, router: () => '/vmware-migration-to-openstack/', beforeSubmit: ({ values }) => validateVmwareSubmission(values) },
  fields: [
    ...ai.fields!.filter(field => field.name !== 'supportingFoundationMembers').map(field => field.name === 'whitePaperBanner' ? { ...field, label: 'White paper promotion' } : field),
    object('supportingFoundationMembers', 'Contributing members', [
      text('title', 'Heading (HTML or Markdown)', true), text('abstract', 'Introduction', true),
      { type: 'object', name: 'companies', label: 'Selected companies', list: true,
        description: 'Select from the reviewed VMware member snapshot. Company records stay service-owned; live service search is pending.',
        ui: { validate: validateVmwareCompanies, itemProps: item => ({ label: companies.find(c => c.id === item.companyId)?.name || 'Company' }) },
        fields: [{ type: 'number', name: 'companyId', nameOverride: 'id', label: 'Company', required: true,
          ui: { component: VmwareCompanySelectionField, validate: (_value, values) => validateVmwareCompanies(values.supportingFoundationMembers?.companies) } }] },
      button('ctaButton', 'Membership button'),
    ]),
    object('planningBanner', 'Migration planning banner', [text('title', 'Heading'), text('abstract', 'Introduction', true), image('background', 'Background'), image('image', 'Illustration'), button('ctaButton', 'Action button')]),
    object('migrationFeatures', 'Feature comparison', [
      text('title', 'Heading (HTML or Markdown)', true),
      { type: 'object', name: 'features', label: 'Comparison features', list: true,
        ui: { itemProps: item => ({ label: `${item.type || 'Column'}: ${item.title || 'Feature'}` }) }, fields: [
          { type: 'string', name: 'type', label: 'Column', required: true, options: [{ label: 'OpenStack', value: 'Openstack' }, { label: 'VMware', value: 'VMWare' }] },
          text('title', 'Feature'), text('abstract', 'Description', true),
        ] }, button('ctaButton', 'Comparison button'), object('sourceLink', 'Source attribution', [text('text', 'Link text'), text('link', 'Source URL')]),
    ]),
    object('successCases', 'Case studies', [text('title', 'Heading (HTML or Markdown)', true),
      { type: 'object', name: 'tools', label: 'Case-study cards', list: true, ui: { itemProps: item => ({ label: item.title || 'Case study' }) }, fields: [text('title', 'Title'), image('image', 'Image'), text('learnMoreUrl', 'Destination')] },
    ]),
    object('migrationGuide', 'Migration guide and survey metrics', [
      object('leftColumn', 'Guide introduction', [image('image', 'Illustration'), text('abstract', 'Introduction (HTML or Markdown)', true)]),
      object('rightColumn', 'Survey metrics', [metric('requestMetric', 'Request metric'), metric('successMetric', 'Success metric')]),
    ]),
    object('labels', 'Comparison and link labels', [text('openstack', 'OpenStack column'), text('vmware', 'VMware column'), text('source', 'Source prefix'), text('learnMore', 'Learn more')]),
  ],
};
