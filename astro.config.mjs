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
    // Optimize React before the first Worker render, so the renderer and
    // application hooks do not retain different pre/post-optimization copies.
    optimizeDeps: {
      noDiscovery: false,
      include: [
        'react', 'react/jsx-runtime', 'react/jsx-dev-runtime',
        'react-dom', 'react-dom/server', 'react-dom/client',
        '@vis.gl/react-google-maps', 'htmlparser2', 'marked', 'sanitize-html',
        '@tinacms/astro/sanitize', '@tinacms/astro/middleware',
      ],
    },
    ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: { $lib: new URL('./src/lib', import.meta.url).pathname },
    },
  },
});
