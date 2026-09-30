import type { APIRoute } from 'astro';
import { lastmod } from '../lib/lastmod';
import { allReleases } from '../lib/releases';
import { absolute } from '../lib/url';

export const GET: APIRoute = async () => {
  const releases = (await allReleases()).map((release) => [`/releases/${release.slug}`, release.date] as const);
  const urls = [...Object.entries(await lastmod()), ...releases]
    .map(([loc, date]) => `<url><loc>${absolute(loc)}</loc><lastmod>${date.toISOString()}</lastmod></url>`)
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
