import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://arjunkrishna.dev',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Crimson Pro',
      cssVariable: '--font-body',
      weights: [400, 600],
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
    '/projects': '/work/',
    '/blog': '/writing/',
  },
});
