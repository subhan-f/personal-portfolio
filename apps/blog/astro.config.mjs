import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://blog.subhanfarrakh.com',
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        item.lastmod = new Date().toISOString().split('T')[0];
        item.changefreq = ChangeFreqEnum.WEEKLY;
        item.priority = item.url === 'https://blog.subhanfarrakh.com/' ? 1.0 : 0.7;
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
