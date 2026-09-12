import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
export default defineConfig({
  site: 'https://astro.openstack.org',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  integrations: [react()],
  vite: { resolve: { alias: { $lib: new URL('./src/lib', import.meta.url).pathname } } },
});
