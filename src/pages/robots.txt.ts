import type { APIRoute } from 'astro';
import { absolute } from '../lib/url';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`);
