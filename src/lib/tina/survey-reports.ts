import { requestWithMetadata } from '@tinacms/astro';
import { surveyReports } from '../../../tina/schema/survey-reports';
import content from '../content/survey-reports.json';
import { document } from './document';
export function loadSurveyReports() {
  const entry = document(surveyReports, 'survey-reports', content);
  return requestWithMetadata({
    query: `query SurveyReportsEditor { ${entry.selection} }`,
    variables: {},
    data: { surveyReports: entry.data },
  });
}
