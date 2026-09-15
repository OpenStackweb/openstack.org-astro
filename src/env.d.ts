/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />
declare namespace Cloudflare { interface Env { MEDIA: R2Bucket; EDITORIAL_GITHUB_TOKEN?: string } }
