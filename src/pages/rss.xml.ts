import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts } from '../lib/posts';
import { site } from '../site';

export async function GET(context: APIContext) {
  const posts = await allPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    items: posts.map((post) => ({
      title: post.title,
      link: post.url,
      pubDate: post.date,
      description: post.excerpt,
    })),
  });
}
