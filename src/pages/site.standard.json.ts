import type { APIRoute } from 'astro';
import { documentKey, publication } from '../lib/atproto';
import { allPosts, postPath } from '../lib/posts';
import { absolute } from '../lib/url';
import { site } from '../site';

// The Standard.site records for this site, read by scripts/atproto.ts. src/integrations/standard.ts moves the file
// out of dist, so it is never deployed.
export const GET: APIRoute = async () =>
  Response.json({
    publication: {
      $type: 'site.standard.publication',
      url: absolute('/').replace(/\/$/, ''),
      name: site.name,
      description: site.description,
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
