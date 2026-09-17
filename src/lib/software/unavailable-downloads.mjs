// Confirmed HTTP 404 by HEAD and browser GET on September 17, 2026.
// The retired OpenStack App Catalog records these same URLs. Keep API content
// intact; remove entries only after recovery or an approved retirement decision.
const archiveOrigin =
  'https://a9913b12a4cd2c87c95f-589461742fc8c857ce7a37ebc26061be.ssl.cf1.rackcdn.com/';
const filenames = ['web-application.zip', 'BigData.zip', 'ecommerce.zip'];

export function unavailableTemplateDownloads(configuration) {
  const descriptions = [configuration.summary, configuration.description];
  return filenames.filter((filename) =>
    descriptions.some((html) => typeof html === 'string' && html.includes(archiveOrigin + filename)),
  );
}
