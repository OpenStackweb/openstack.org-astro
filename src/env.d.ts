/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />
declare namespace Cloudflare {
  interface Env {
    MEDIA: R2Bucket;
    MARKETPLACE_SERVICE_ORIGIN?: string;
    SURVEY_SERVICE_ORIGIN?: string;
    SURVEY_ACCESS_CLIENT_ID?: string;
    SURVEY_ACCESS_CLIENT_SECRET?: string;
    EDITORIAL_GITHUB_TOKEN?: string;
    VISITOR_AUTH_ENABLED?: string;
    VISITOR_AUTH_CLIENT_ID?: string;
  }
}
