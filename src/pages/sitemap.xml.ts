import type { APIRoute } from 'astro';
import { allPosts } from '../lib/posts';
import { lastUpdated } from '../lib/updated';
import { absolute } from '../lib/url';

const latest = (...dates: Date[]) => new Date(Math.max(...dates.map((date) => date.getTime())));

export const GET: APIRoute = async () => {
  const posts = await allPosts();
  const pages = [
    { loc: '/', lastmod: latest(lastUpdated('src/content/home.mdx', 'src/content/projects'), posts[0].date) },
    { loc: '/work/', lastmod: lastUpdated('src/content/projects', 'src/content/small.yaml') },
    { loc: '/writing/', lastmod: posts[0].date },
  ];

  const urls = pages
    .map(({ loc, lastmod }) => `<url><loc>${absolute(loc)}</loc><lastmod>${lastmod.toISOString()}</lastmod></url>`)
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
