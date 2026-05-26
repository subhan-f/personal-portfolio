import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://subhanfarrakh.com',
  base: '/blog/',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/blog/tag/'),
      serialize(item) {
        item.lastmod = new Date().toISOString().split('T')[0];
        item.changefreq = ChangeFreqEnum.WEEKLY;
        item.priority = item.url === 'https://subhanfarrakh.com/blog/' ? 1.0 : 0.7;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: { fs: { strict: false } },
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  output: 'static',
});
