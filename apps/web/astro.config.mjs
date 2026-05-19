// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";

export default defineConfig({
  site: "https://subhanfarrakh.com",
  integrations: [
    react(),
    mdx(),
    sitemap({
      serialize(item) {
        if (item.url === "https://subhanfarrakh.com/") {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.MONTHLY;
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
