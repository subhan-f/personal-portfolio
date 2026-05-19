// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

export default defineConfig({
  site: "https://subhanfarrakh.com",
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const url = item.url;
        item.lastmod = new Date().toISOString().split('T')[0];
        if (url === "https://subhanfarrakh.com/") {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (url.includes('/projects/') || url.includes('/experience/')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (/\/(faq|skills)/.test(url)) {
          item.priority = 0.4;
          item.changefreq = ChangeFreqEnum.YEARLY;
        } else {
          item.priority = 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        strict: false,
      },
    },
  },
  server: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
});
