# Subhan Farrakh — Personal Portfolio

> AI Automation Engineer · Full-Stack Developer · [subhanfarrakh.com](https://subhanfarrakh.com)

[![Live](https://img.shields.io/badge/Live-subhanfarrakh.com-0d9488?style=flat-square)](https://subhanfarrakh.com)
[![Blog](https://img.shields.io/badge/Blog-blog.subhanfarrakh.com-6366f1?style=flat-square)](https://blog.subhanfarrakh.com)
[![Astro](https://img.shields.io/badge/Astro-6-FF5D01?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Monorepo Structure

```text
.
├── apps/
│   ├── web/            # Portfolio site — subhanfarrakh.com
│   ├── blog/           # Blog — blog.subhanfarrakh.com
│   ├── cms/            # Strapi CMS (content backend)
│   └── social-worker/  # BullMQ fan-out social publishing service
├── pnpm-workspace.yaml
└── .github/
    └── workflows/
        └── redeploy-web.yml   # Deploys web on CMS content publish
```

---

## Apps

### `apps/web` — Portfolio Site

The main portfolio at [subhanfarrakh.com](https://subhanfarrakh.com).

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Framework  | Astro 6 (SSG + island architecture)                 |
| UI         | React 19                                            |
| Styling    | Tailwind CSS v4 (Vite plugin)                       |
| Animation  | Framer Motion 12                                    |
| CMS        | Strapi (headless, via REST API)                     |
| Validation | Zod 4                                               |
| Media      | Cloudinary                                          |
| Analytics  | Vercel Analytics + Speed Insights                   |
| SEO        | JSON-LD structured data, XML sitemap, IndexNow      |

**Routes**

| Route                          | Description                            |
| ------------------------------ | -------------------------------------- |
| `/`                            | Home — hero, about, featured work      |
| `/projects`                    | Project listing (CollectionPage schema)|
| `/projects/[slug]`             | Project detail with BreadcrumbList     |
| `/experience`                  | Work history                           |
| `/experience/[slug]`           | Experience detail with BreadcrumbList  |
| `/skills`                      | Skills overview                        |
| `/testimonials`                | Client testimonials (AggregateRating)  |
| `/faq`                         | Frequently asked questions             |
| `/contact`                     | Contact form                           |
| `/services/web-development`    | Service landing page                   |
| `/services/ai-automation`      | Service landing page                   |
| `/services/ai-agents`          | Service landing page                   |
| `/404`                         | Not found (noindex)                    |

---

### `apps/blog` — Blog

Standalone blog at [blog.subhanfarrakh.com](https://blog.subhanfarrakh.com).

| Layer     | Technology                                      |
| --------- | ----------------------------------------------- |
| Framework | Astro 6                                         |
| UI        | React 19                                        |
| Styling   | Tailwind CSS v4                                 |
| Content   | Strapi (articles fetched at build time)         |
| OG Images | Satori + @resvg/resvg-js (generated at build)  |
| Search    | Fuse.js (client-side)                           |
| RSS       | @astrojs/rss                                    |
| Sitemap   | @astrojs/sitemap                                |

**Routes**

| Route          | Description                                 |
| -------------- | ------------------------------------------- |
| `/`            | Blog index with search                      |
| `/[slug]`      | Article (BlogPosting + BreadcrumbList)      |
| `/tag/[tag]`   | Tag filter (noindex)                        |
| `/og/[slug].png` | Auto-generated OG image per article      |
| `/rss.xml`     | RSS feed                                    |
| `/sitemap-index.xml` | Sitemap                               |
| `/404`         | Not found (noindex)                         |

---

### `apps/social-worker` — Social Publishing Service

A Node.js microservice that automatically publishes new articles to social platforms after the blog deployment is live.

**Architecture**

```
Strapi webhook (entry.publish)
        │
        ▼
POST /webhook/strapi
  └─ parks a fanout job in BullMQ with a 24h delay
        │
Vercel webhook (deployment.succeeded)
        │
        ▼
POST /webhook/vercel-deploy
  └─ promotes all delayed fanout jobs → executes immediately
        │
        ▼
fanout worker
  └─ HEAD check (blog URL must return 200)
  └─ enqueues one job per platform
        │
        ├─► linkedin worker   → UGC Posts API v2
        ├─► twitter worker    → API v2 (OAuth 1.0a, hand-rolled)
        ├─► bluesky worker    → AT Protocol createRecord
        ├─► reddit worker     → OAuth2 password grant → /api/submit
        └─► hashnode worker   → GraphQL publishPost (canonical ref)
```

The two-webhook design prevents race conditions: Strapi fires immediately on publish, but the job only executes once Vercel confirms the deployment succeeded. The 24h delay is a safety net if the Vercel webhook never fires.

**Environment variables** — see `apps/social-worker/.env.example`

---

### `apps/cms` — Strapi CMS

Headless Strapi instance serving content to both `apps/web` and `apps/blog` via REST API. Triggers a GitHub repository dispatch event on content publish, which kicks off the `redeploy-web` workflow.

---

## CI/CD

**`redeploy-web.yml`** — triggered by `repository_dispatch: cms-published`

1. 60-second debounce (absorbs rapid CMS saves)
2. Triggers Vercel deploy hook for the web app
3. Submits URLs to IndexNow (Bing, Yandex)

Vercel deploys `apps/web` and `apps/blog` independently as separate projects.

---

## Getting Started

**Prerequisites:** Node.js ≥ 22, [pnpm](https://pnpm.io)

```bash
# Install all workspace dependencies
pnpm install

# Start the portfolio dev server (http://localhost:4321)
pnpm --filter web dev

# Start the blog dev server (http://localhost:4322)
pnpm --filter blog dev

# Start the social worker
pnpm --filter social-worker dev
```

---

## Scripts (workspace root)

| Command                          | Description                            |
| -------------------------------- | -------------------------------------- |
| `pnpm --filter web dev`          | Portfolio dev server at :4321          |
| `pnpm --filter blog dev`         | Blog dev server at :4322               |
| `pnpm --filter web build`        | Production build for portfolio         |
| `pnpm --filter blog build`       | Production build for blog              |
| `pnpm --filter social-worker dev`| Social worker with hot reload          |

---

## Environment Variables

### `apps/web/.env`

```env
PUBLIC_EMAILJS_SERVICE_ID=
PUBLIC_EMAILJS_TEMPLATE_ID=
PUBLIC_EMAILJS_PUBLIC_KEY=
STRAPI_URL=
STRAPI_TOKEN=
```

### `apps/blog/.env`

```env
STRAPI_URL=
STRAPI_TOKEN=
```

### `apps/social-worker/.env`

See `apps/social-worker/.env.example` for the full list including Twitter, LinkedIn, Bluesky, Reddit, Hashnode credentials and BullMQ/Redis config.

### GitHub Secrets (CI)

| Secret               | Used by                                    |
| -------------------- | ------------------------------------------ |
| `VERCEL_DEPLOY_HOOK` | Trigger Vercel redeploy on CMS publish     |
| `INDEXNOW_KEY`       | Submit URLs to Bing/Yandex after deploy    |

---

## License

MIT © [Subhan Farrakh](https://subhanfarrakh.com)
