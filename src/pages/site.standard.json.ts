import type { APIRoute } from 'astro';
import { documentKey, publication } from '../lib/atproto';
import { allPosts, postPath } from '../lib/posts';
import { absolute } from '../lib/url';
import { site } from '../site';

// The site's colours from src/styles/site.css. Without a publication icon, Bluesky draws the publication's avatar
// from these and the first letter of its name.
const rgb = (hex: string) => {
  const [r, g, b] = (hex.slice(1).match(/../g) ?? []).map((pair) => parseInt(pair, 16));
  return { $type: 'site.standard.theme.color#rgb', r, g, b };
};
const theme = { background: '#f3f2ee', foreground: '#2a2826', accent: '#c5370f', accentForeground: '#f3f2ee' };

// The Standard.site records for this site, read by scripts/atproto.ts. src/integrations/standard.ts moves the file
// out of dist, so it is never deployed.
export const GET: APIRoute = async () =>
  Response.json({
    publication: {
      $type: 'site.standard.publication',
      url: absolute('/').replace(/\/$/, ''),
      name: site.name,
      description: site.description,
      basicTheme: {
        $type: 'site.standard.theme.basic',
        ...Object.fromEntries(Object.entries(theme).map(([role, hex]) => [role, rgb(hex)])),
      },
    },
    documents: (await allPosts()).map((post) => ({
      rkey: documentKey(post.date, postPath(post)),
      value: {
        $type: 'site.standard.document',
        site: publication,
        path: postPath(post),
        title: post.title,
        description: post.excerpt,
        publishedAt: post.date.toISOString(),
        ...(post.tags?.length && { tags: post.tags }),
      },
    })),
  });
