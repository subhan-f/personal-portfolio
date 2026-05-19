import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchStrapi } from '@lib/strapi';
import type { StrapiList, StrapiArticle } from '@lib/strapi';

export async function GET(ctx: APIContext) {
  const { data: posts } = await fetchStrapi<StrapiList<StrapiArticle>>(
    '/articles',
    { 'sort': 'publishedAt:desc' }
  );

  return rss({
    title: 'Subhan Farrakh — Blog',
    description: 'Thoughts on web development, AI, and modern engineering.',
    site: ctx.site ?? 'https://blog.subhanfarrakh.com',
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: new Date(post.publishedAt),
      link: `/${post.slug}`,
    })),
  });
}
