import type { Collection, TinaField } from 'tinacms';
import companies from '../../src/lib/companies/ai-contributors.json';
import { CompanySelectionField } from '../CompanySelectionField';
import {
  validateCompanySelections,
  validateAiSubmission,
} from '../company-selection-validation.mjs';
const text = (name: string, label: string, multiline = false): TinaField => ({
  type: 'string',
  name,
  label,
  ...(multiline ? { ui: { component: 'textarea' } } : {}),
});
const button = (name: string, label: string): TinaField => ({
  type: 'object',
  name,
  label,
  fields: [text('title', 'Button text'), text('url', 'Destination')],
});
export const ai: Collection = {
  name: 'ai',
  label: 'OpenStack for AI',
  path: 'src/lib/content',
  match: { include: 'openstack-for-ai' },
  format: 'json',
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/openstack-for-ai/',
    beforeSubmit: ({ values }) => validateAiSubmission(values),
  },
  fields: [
    text('description', 'Search and social description (published metadata)', true),
    {
      type: 'object',
      name: 'header',
      label: 'Hero',
      fields: [
        { type: 'image', name: 'image', label: 'Background image' },
        { type: 'string', name: 'title', label: 'Page heading', required: true },
        text('abstract', 'Introduction (HTML or Markdown)', true),
        button('joinButton', 'Join button'),
        button('migrationButton', 'White paper button'),
      ],
    },
    {
      type: 'object',
      name: 'migrationStories',
      label: 'Community quotations',
      list: true,
      ui: { itemProps: (item) => ({ label: item.author || 'Quotation' }) },
      fields: [text('abstract', 'Quotation', true), text('author', 'Attribution')],
    },
    {
      type: 'object',
      name: 'supportingFoundationMembers',
      label: 'Contributing members',
      fields: [
        text('title', 'Heading (HTML or Markdown)', true),
        text('abstract', 'Introduction', true),
        {
          type: 'object',
          name: 'companies',
          label: 'Selected companies',
          list: true,
          description:
            'Selections reference the reviewed Summit service snapshot. Names and logos are not edited here. Live service search is pending.',
          ui: {
            validate: (value) => validateCompanySelections(value),
            itemProps: (item) => ({
              label: companies.find((company) => company.id === item.companyId)?.name || 'Company',
            }),
          },
          fields: [
            {
              type: 'number',
              name: 'companyId',
              nameOverride: 'id',
              label: 'Company',
              required: true,
              ui: {
                component: CompanySelectionField,
                validate: (_value, values) =>
                  validateCompanySelections(values.supportingFoundationMembers?.companies),
              },
            },
          ],
        },
        button('ctaButton', 'Membership button'),
      ],
    },
    {
      type: 'object',
      name: 'whitePaperBanner',
      label: 'Working group promotion',
      fields: [
        text('title', 'Heading'),
        text('abstract', 'Introduction (HTML or Markdown)', true),
        button('ctaButton', 'Working group button'),
      ],
    },
    {
      type: 'object',
      name: 'carousel',
      label: 'Quotation controls',
      fields: [
        text('label', 'Carousel label'),
        text('previous', 'Previous'),
        text('next', 'Next'),
        text('pause', 'Pause'),
        text('play', 'Play'),
        text('of', 'Position separator'),
      ],
    },
  ],
};
