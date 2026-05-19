import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { fetchStrapi, getArticleTags } from '@lib/strapi';
import { calcReadingTime } from '@lib/markdown';
import type { StrapiList, StrapiArticle } from '@lib/strapi';

export async function getStaticPaths() {
  const { data: posts } = await fetchStrapi<StrapiList<StrapiArticle>>('/articles', {
    'sort': 'publishedAt:desc',
    'populate[blocks][populate]': '*',
  });
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}

// Cache fonts across requests during the same build
let interRegular: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;

async function getFonts() {
  if (!interRegular || !interBold) {
    [interRegular, interBold] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff').then((r) => r.arrayBuffer()),
      fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff').then((r) => r.arrayBuffer()),
    ]);
  }
  return { interRegular: interRegular!, interBold: interBold! };
}

function h(type: string, props: Record<string, unknown>, ...children: unknown[]) {
  const resolved = children.length === 0 ? undefined : children.length === 1 ? children[0] : children;
  return { type, key: null, props: resolved !== undefined ? { ...props, children: resolved } : props };
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: StrapiArticle };
  const { interRegular, interBold } = await getFonts();

  const tags = getArticleTags(post);
  const readingTime = calcReadingTime(post.blocks);
  const titleFontSize = post.title.length > 65 ? 42 : post.title.length > 45 ? 48 : 54;
  const pubDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const tagElements = tags.slice(0, 3).map((tag, i) =>
    h('div', {
      key: String(i),
      style: {
        display: 'flex',
        backgroundColor: 'rgba(28,216,210,0.08)',
        color: '#1cd8d2',
        fontSize: 15,
        fontWeight: 500,
        padding: '5px 13px',
        borderRadius: 6,
        border: '1px solid rgba(28,216,210,0.22)',
      },
    }, tag)
  );

  const element = h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: 1200,
      height: 630,
      backgroundColor: '#080b12',
      fontFamily: 'Inter',
      overflow: 'hidden',
    },
  },
    // Top teal bar
    h('div', { style: { width: '100%', height: 4, background: 'linear-gradient(90deg,#1cd8d2,#00bf8f)' } }),
    // Subtle grid overlay
    h('div', {
      style: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(28,216,210,0.06) 0%, transparent 60%)',
        display: 'flex',
      },
    }),
    // Content
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '44px 60px 48px',
        justifyContent: 'space-between',
      },
    },
      // Top: domain label
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { color: '#1cd8d2', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' } },
          'blog.subhanfarrakh.com'
        )
      ),
      // Middle: title + tags
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
        h('div', {
          style: {
            color: '#f1f5f9',
            fontSize: titleFontSize,
            fontWeight: 700,
            lineHeight: 1.18,
            letterSpacing: '-0.02em',
            maxWidth: 1020,
          },
        }, post.title),
        tags.length > 0
          ? h('div', { style: { display: 'flex', gap: 10 } }, ...tagElements)
          : h('div', { style: { display: 'flex' } })
      ),
      // Bottom: author + meta
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          h('div', {
            style: {
              width: 38, height: 38, borderRadius: 19,
              background: 'linear-gradient(135deg,#1cd8d2,#00bf8f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#080b12',
            },
          }, 'SF'),
          h('span', { style: { color: '#e2e8f0', fontSize: 19, fontWeight: 600 } }, 'Subhan Farrakh'),
          h('span', { style: { color: '#374151', fontSize: 19 } }, '·'),
          h('span', { style: { color: '#94a3b8', fontSize: 18 } }, `${readingTime} min read`),
        ),
        h('span', { style: { color: '#64748b', fontSize: 16 } }, pubDate),
      )
    )
  );

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
