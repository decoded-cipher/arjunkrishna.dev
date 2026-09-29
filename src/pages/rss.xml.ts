import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts } from '../lib/posts';
import { absolute } from '../lib/url';
import { site } from '../site';

export async function GET(context: APIContext) {
  const posts = await allPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    customData: [
      '<language>en</language>',
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml"/>`,
      `<image><url>${absolute('/icon-512.png')}</url><title>${site.name}</title><link>${absolute('/')}</link></image>`,
    ].join(''),
    items: posts.map((post) => ({
      title: post.title,
      link: post.url,
      pubDate: post.date,
      description: post.excerpt,
      customData: `<dc:creator>${site.name}</dc:creator>`,
    })),
  });
}
