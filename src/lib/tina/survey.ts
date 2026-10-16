import { requestWithMetadata } from '@tinacms/astro';
import { survey } from '../../../tina/schema/survey';
import content from '../content/survey.json';
import { document } from './document';
export function loadSurvey() {
  const entry = document(survey, 'survey', content);
  return requestWithMetadata({query: `query SurveyEditor { ${entry.selection} }`, variables: {}, data: { survey: entry.data }});
}
