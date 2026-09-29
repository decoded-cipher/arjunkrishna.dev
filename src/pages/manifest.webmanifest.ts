import type { APIRoute } from 'astro';
import { site } from '../site';
import { path } from '../lib/url';

export const GET: APIRoute = () =>
  Response.json({
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: path('/'),
    scope: path('/'),
    display: 'browser',
    background_color: '#f3f2ee',
    theme_color: '#f3f2ee',
    icons: [
      { src: path('/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: path('/icon-512.png'), sizes: '512x512', type: 'image/png' },
      { src: path('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  });
