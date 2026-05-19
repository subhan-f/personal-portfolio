'use strict';

// ─── Article data ─────────────────────────────────────────────────────────────

const articles = [
  {
    title: 'Why I Rebuilt My Portfolio with Astro',
    slug: 'why-i-rebuilt-my-portfolio-with-astro',
    description: "Zero JS by default — how Astro's island architecture changes the game.",
    tags: ['Astro', 'Web Development', 'Performance'],
    blocks: [
      {
        __component: 'shared.rich-text',
        body: `## The Problem with SPAs for Content Sites

Most portfolio sites don't need React to render a headline. Yet most developers — myself included — reach for a React SPA by default. The result is hundreds of kilobytes of JavaScript shipped to the browser before a single word of content appears.

I spent two years running my portfolio on Next.js. It was fine. But every Lighthouse audit told the same story: a content site weighed down by a full SPA runtime.

## Enter Astro

Astro's core idea is deceptively simple: **ship HTML, not JavaScript**. It renders your components to static HTML at build time and only sends JavaScript for the parts that need it — what the Astro team calls "islands."

\`\`\`astro
---
// This component produces zero JS in the browser
import HeroText from './HeroText.astro';
---

<HeroText />

<!-- This island hydrates only when visible -->
<AnimatedCounter client:visible />
\`\`\`

The \`client:*\` directive is the key primitive. You get granular control:

| Directive | When it hydrates |
|---|---|
| \`client:load\` | Immediately on page load |
| \`client:idle\` | When the browser is idle |
| \`client:visible\` | When the component enters the viewport |
| \`client:media\` | When a CSS media query matches |

## Mixing Frameworks Without the Drama

The part that surprised me most: Astro lets you mix React, Svelte, Vue, and Solid in the same project. Not because you should, but because you can pick the right tool per component.

My portfolio uses React for interactive sections (animations, forms) and zero-JS Astro components for everything static. The build output is leaner, the runtime is minimal, and the DX is excellent.

## Real Numbers

After migrating from Next.js to Astro:

- **Total JS shipped**: dropped from 312 KB to 48 KB
- **Time to Interactive**: 1.8s → 0.4s on a throttled connection
- **Lighthouse Performance**: 71 → 97

Astro isn't for every project. If you're building a highly dynamic app with client-side state everywhere, Next.js or Remix are the right tools. But for content-heavy sites — portfolios, blogs, marketing pages — Astro is the most honest choice I've found.

## The Part Nobody Talks About

Astro's content collections are underrated. Type-safe, schema-validated MDX files with zero boilerplate. The config is a single \`content.config.ts\` file, and you get autocomplete for frontmatter fields in every post.

\`\`\`ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()),
  }),
});
\`\`\`

If you've been holding off on Astro because it feels like a niche tool — it isn't anymore. Version 5 is production-ready, the ecosystem is mature, and the performance benefits are real.`,
      },
    ],
  },

  {
    title: 'shadcn/ui is Not a Component Library',
    slug: 'shadcn-ui-is-not-a-component-library',
    description: "Why shadcn/ui's copy-paste model beats installing a component library.",
    tags: ['shadcn/ui', 'React', 'UI Design'],
    blocks: [
      {
        __component: 'shared.rich-text',
        body: `## The Standard Model is Broken

Every team I've worked on has had the same conversation at some point: "The design doesn't match what the library gives us, but overriding it is a nightmare." You end up in specificity wars, wrapping components in extra divs, and fighting the library's opinions with your own.

shadcn/ui takes a different position entirely: **don't install a library, own the code**.

## What shadcn/ui Actually Is

When you run \`npx shadcn@latest add button\`, nothing gets added to \`node_modules\`. Instead, a \`Button.tsx\` file lands in your \`components/ui/\` directory — with full source code, your project's Tailwind theme already wired in, and zero external dependency for the component itself.

\`\`\`tsx
// This is YOUR file now. Edit it freely.
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
\`\`\`

The underlying primitives (Radix UI for accessibility, CVA for variants, Tailwind for styling) are still npm dependencies. But the component layer — the part you interact with daily — is yours.

## Why This Changes Everything

**Customization is the default, not the exception.** Need a ghost button with a custom hover color that matches your brand? Edit the file. No \`sx\` props, no CSS overrides, no wrapper components. Just change the Tailwind class.

**The abstraction boundary is honest.** Traditional component libraries hide their internals. When something goes wrong, you're debugging minified code in \`node_modules\`. With shadcn/ui, the code is in your repo, readable and traceable.

**Updates are deliberate.** This is the tradeoff: shadcn/ui components don't auto-update. You re-run \`npx shadcn@latest add button\` and get a diff to review. Some teams see this as a downside. I see it as appropriate friction — UI should change intentionally.

## The CSS Variable System

shadcn/ui pairs with a CSS variable design token system:

\`\`\`css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
\`\`\`

Change the variables, the entire system shifts. Dark mode is a matter of flipping a class on \`<html>\`. The whole system is coherent because it's all pointing at the same tokens.

## When Not to Use It

shadcn/ui is a great fit for product UI where you need control. It's less ideal if:

- You're prototyping fast and don't want to own components yet
- Your team doesn't have a design system and won't maintain the components
- You're using a framework that isn't React (though ports exist for Vue, Svelte, etc.)

For those cases, a traditional library like MUI or Mantine might serve you better. But if you've ever felt constrained by a component library, shadcn/ui is worth a serious look.`,
      },
    ],
  },

  {
    title: 'React 19: What Actually Changed for Developers',
    slug: 'react-19-what-actually-changed-for-developers',
    description: 'Actions, the compiler, and what you can stop writing in React 19.',
    tags: ['React', 'JavaScript', 'Web Development'],
    blocks: [
      {
        __component: 'shared.rich-text',
        body: `## Stop Writing useEffect for Data Mutations

The single most impactful change in React 19 for day-to-day code is **Actions**. If you've ever written a component that looks like this:

\`\`\`tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await submitForm(formData);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
\`\`\`

React 19 replaces this entire pattern. Actions are async functions that React tracks automatically:

\`\`\`tsx
const [error, submitAction, isPending] = useActionState(
  async (prevState, formData) => {
    const result = await submitForm(formData);
    if (!result.ok) return result.error;
    return null;
  },
  null
);
\`\`\`

The \`isPending\` state is managed by React. The transition is batched. The optimistic update pattern is built in via \`useOptimistic\`.

## The React Compiler (Forget)

React 19 ships with an optional compiler (previously called "React Forget") that automatically memoizes your components. In practice, this means you can stop writing \`useMemo\` and \`useCallback\` defensively.

Before:
\`\`\`tsx
const expensiveValue = useMemo(() => compute(data), [data]);
const stableHandler = useCallback(() => doSomething(id), [id]);
\`\`\`

After (with compiler):
\`\`\`tsx
const expensiveValue = compute(data);
const stableHandler = () => doSomething(id);
\`\`\`

The compiler statically analyzes your component tree and inserts memoization where it's beneficial. Not everywhere — that would be wasteful — but specifically where re-renders would be expensive.

**The important caveat**: the compiler only works on code that follows the Rules of React (no mutations during render, stable hook call order, etc.). If your codebase has workarounds for React's rules, the compiler won't touch those components and will tell you why.

## use() — The New Primitive for Promises

The new \`use()\` hook lets you read a Promise inside a component and integrates with Suspense:

\`\`\`tsx
function UserProfile({ userPromise }) {
  // This suspends the component until userPromise resolves
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
\`\`\`

Unlike \`useEffect\`, \`use()\` can be called conditionally and inside loops — it breaks the hook rules constraint for this specific case because it's not a hook in the traditional sense.

## What You Can Stop Doing

With React 19, you can retire several common patterns:

- **\`forwardRef()\`** — ref is now a regular prop
- **Manual \`loading\` state for mutations** — \`useActionState\` handles it
- **Defensive \`useMemo\` everywhere** — the compiler handles it
- **Context value memoization** — \`<Context value={...}>  \` is now valid syntax

\`\`\`tsx
// Before
const MyContext = React.createContext();
<MyContext.Provider value={value}>

// After
<MyContext value={value}>
\`\`\`

## The Real Upgrade Path

React 19 is backward compatible. Existing code doesn't break. The upgrade story is:

1. Update \`react\` and \`react-dom\` to 19
2. Fix any \`ReactDOM.render\` calls (use \`createRoot\`)
3. Opt in to the compiler via your bundler plugin
4. Gradually adopt Actions as you touch existing mutation code

The wins are real and the migration is incremental — that's the best kind of upgrade.`,
      },
    ],
  },

  {
    title: 'Scaling Monorepos with Turborepo',
    slug: 'scaling-monorepos-with-turborepo',
    description: 'How Turborepo\'s task graph and caching cut build times from minutes to seconds.',
    tags: ['Turborepo', 'Monorepo', 'DevOps'],
    blocks: [
      {
        __component: 'shared.rich-text',
        body: `## Why Monorepos Break Down Without Tooling

A monorepo starts simple: two packages, fast builds, easy sharing. Then it grows. Six packages, twelve packages. Suddenly \`npm run build\` in the root takes four minutes because it rebuilds every package every time, even the ones that haven't changed.

This is the problem Turborepo was built to solve.

## The Task Graph

Turborepo models your monorepo as a task graph — a directed acyclic graph where nodes are tasks and edges are dependencies between them.

\`\`\`json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
\`\`\`

The \`^\` prefix means "run this task in all dependencies first." So when you run \`turbo build\` in a monorepo where \`web\` depends on \`ui\` and \`utils\`, Turbo:

1. Builds \`utils\` (no dependencies)
2. Builds \`ui\` (depends on \`utils\`)
3. Builds \`web\` (depends on both)

And it does this with maximum parallelism — tasks that don't depend on each other run concurrently.

## Caching: The Real Win

The graph is clever. The cache is transformative.

Turbo hashes the inputs of every task: source files, environment variables, lock files, task configuration. If the hash matches a previous run, Turbo replays the output instantly — it doesn't run the task at all.

\`\`\`bash
# First run: builds everything (4m 12s)
turbo build

# Second run, nothing changed: replays from cache (1.3s)
turbo build
>>> FULL TURBO (cache hit)
\`\`\`

**Remote caching** extends this to your entire team and CI. Once a teammate builds a package, everyone else gets the cached output. A fresh CI run on a PR that only touches \`web\` doesn't rebuild \`ui\` — it fetches the cached artifact from Vercel Remote Cache or your own S3 bucket.

## Workspace Structure That Scales

The package structure that works well in practice:

\`\`\`
apps/
  web/          # User-facing app (Next.js, Astro, etc.)
  cms/          # Admin/CMS app
packages/
  ui/           # Shared React components
  typescript-config/  # Shared tsconfig bases
  eslint-config/      # Shared ESLint configs
\`\`\`

Packages in \`packages/\` should be internal-only by default (\`"private": true\`). They're not published to npm; they're consumed directly by apps via workspace references:

\`\`\`json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
\`\`\`

## Common Mistakes

**Putting too much in one package.** If a package has 50 components and you change one, the entire package's cache is invalidated. Split by domain, not by size.

**Not specifying \`outputs\`.**  Without outputs defined, Turbo can't cache build artifacts. Every task that produces files needs an \`outputs\` entry.

**Using \`dependsOn: ["build"]\` instead of \`["^build"]\`.** The former depends on the build task in the *same* package. The latter depends on build in *all dependencies* — which is almost always what you want.

## The Pipeline Mental Model

Think of your monorepo tasks like a pipeline in a factory. Raw inputs (source code) flow through stages (lint → type-check → build → test) with shared components built once and reused everywhere. Turborepo's job is to run that pipeline as fast as physics allows, skipping any stage where the inputs haven't changed.

Once you internalize this mental model, the configuration becomes intuitive and debugging cache misses becomes methodical.`,
      },
    ],
  },

  {
    title: 'Architecture Decisions That Prevent Technical Debt',
    slug: 'architecture-decisions-that-prevent-technical-debt',
    description: 'Boundaries, contracts, and constraints that keep codebases maintainable.',
    tags: ['Architecture', 'System Design', 'Engineering'],
    blocks: [
      {
        __component: 'shared.rich-text',
        body: `## Technical Debt is Usually an Architecture Debt

The phrase "technical debt" gets applied to everything from poorly named variables to missing tests. But the debt that actually slows teams down — the kind that makes a simple feature take three sprints — almost always traces back to an architectural decision made early on.

Not a bad decision necessarily. An uncommunicated one.

## Bounded Contexts: Draw Lines Before They're Lines

The most valuable architectural work happens before you write code: deciding what belongs together and what doesn't.

In Domain-Driven Design, a **bounded context** is an explicit boundary around a part of the system that has its own model, its own language, and its own rules. Inside the boundary, concepts have precise meanings. Across boundaries, you translate.

Practically, this means resisting the urge to share a single \`User\` type across your entire codebase. The \`User\` in your authentication service cares about passwords and sessions. The \`User\` in your billing service cares about payment methods and invoice history. Forcing them to share a type couples two domains that should evolve independently.

\`\`\`ts
// ❌ One User to rule them all — becomes unmaintainable
interface User {
  id: string;
  email: string;
  passwordHash: string;    // Auth concern
  stripeCustomerId: string; // Billing concern
  preferredLocale: string;  // Profile concern
  lastLoginAt: Date;        // Session concern
}

// ✅ Context-specific models
// auth/types.ts
interface AuthUser { id: string; email: string; passwordHash: string; }

// billing/types.ts
interface BillingCustomer { userId: string; stripeCustomerId: string; }
\`\`\`

## Ports and Adapters (Hexagonal Architecture)

The architectural pattern I return to most often is Ports and Adapters, also called Hexagonal Architecture.

The core idea: your business logic (the hexagon) should know nothing about infrastructure. It expresses its needs via **ports** (interfaces), and the outside world fulfills those ports via **adapters** (implementations).

\`\`\`ts
// Port — defined by the domain
interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

// Adapter — implementation detail, swappable
class SendGridEmailService implements EmailService {
  async send(to, subject, body) {
    await sendgrid.send({ to, subject, html: body });
  }
}

class LogEmailService implements EmailService {
  async send(to, subject, body) {
    console.log(\`[email] to:\${to} subject:\${subject}\`);
  }
}
\`\`\`

In tests, you inject \`LogEmailService\`. In production, \`SendGridEmailService\`. Your domain code never changes.

The payoff isn't test isolation — though that's a bonus. The payoff is that when you switch from SendGrid to Postmark, the migration is a one-file change.

## The Rule of Explicit Dependencies

Hidden dependencies are where maintenance cost hides. A function that reaches into a global \`config\` object, a component that reads from a global store without declaring it in props, a service that imports another service directly instead of having it injected.

Make dependencies explicit:

\`\`\`ts
// ❌ Hidden dependency
function getFeatureFlag(key: string) {
  return globalConfig.features[key]; // Where does globalConfig come from?
}

// ✅ Explicit dependency
function getFeatureFlag(key: string, config: FeatureConfig) {
  return config.features[key];
}
\`\`\`

Explicit dependencies are discoverable, testable, and composable. They make the call graph visible in the code itself.

## Versioned Contracts Between Services

If you have multiple services or packages communicating, the interface between them is a contract. Treat it like one.

- Define contracts in code (TypeScript interfaces, Zod schemas, OpenAPI specs)
- Version them explicitly when they change
- Never change a contract in a way that breaks existing consumers without a migration path

The most underused tool here is **schema validation at runtime boundaries**:

\`\`\`ts
import { z } from 'zod';

const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  publishedAt: z.string().datetime(),
});

// Validate at the API boundary, not deep inside the app
const article = ArticleSchema.parse(await fetchArticle(id));
\`\`\`

If the API contract breaks — a field is renamed, a type changes — you find out immediately at the boundary, not six function calls deep in a runtime error.

## One Rule to Internalize

If you could only apply one architectural principle, make it this: **separate what changes from what stays the same**.

Business logic changes. Infrastructure changes. UI changes. They change at different rates and for different reasons. The architecture that ages well is the one that lets each layer change independently without cascading rewrites through the others.

Draw that boundary clearly, document why it exists, and future-you will thank present-you.`,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function upsertArticle(data) {
  const existing = await strapi.documents('api::article.article').findFirst({
    filters: { slug: data.slug },
  });

  if (existing) {
    await strapi.documents('api::article.article').update({
      documentId: existing.documentId,
      data,
    });
    console.log(`  Updated: ${data.title}`);
  } else {
    await strapi.documents('api::article.article').create({ data });
    console.log(`  Created: ${data.title}`);
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';

  console.log('Seeding blog articles...');
  for (const article of articles) {
    await upsertArticle({ ...article, publishedAt: new Date().toISOString() });
  }

  console.log('\nDone — 5 articles seeded.');
  await app.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
