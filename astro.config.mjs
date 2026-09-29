import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';

const site = process.env.SITE_URL ?? 'https://arjunkrishna.dev';
const base = process.env.BASE_PATH ?? '/';
const to = (path) => `${base.replace(/\/$/, '')}${path}`;

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [mdx()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Crimson Pro',
      cssVariable: '--font-body',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-display',
      weights: [500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  redirects: {
    '/projects': to('/work/'),
    '/blog': to('/writing/'),
  },
});
