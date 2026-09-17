import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
export default defineConfig({
  site: 'https://astro.openstack.org',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  integrations: [react(), tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
    resolve: { alias: { $lib: new URL('./src/lib', import.meta.url).pathname } },
  },
});
