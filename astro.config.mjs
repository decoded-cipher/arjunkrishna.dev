import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import stats from './src/integrations/stats';

const site = process.env.SITE_URL ?? 'https://arjunkrishna.dev';
const base = process.env.BASE_PATH ?? '/';
const to = (path) => `${base.replace(/\/$/, '')}${path}`;

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [mdx(), stats()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'EB Garamond',
      cssVariable: '--font-serif',
      weights: [400],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  redirects: {
    '/work': to('/projects'),
    '/writing': to('/blog'),
  },
});
