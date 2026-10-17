import { getCollection } from 'astro:content';
import type { Post } from '../components/PostList.astro';

// Each post's address on this site, after the last part of its URL: /blog/inovus/<slug> or /blog/medium/<slug>.
// It forwards to the post and carries the post's Standard.site link.
export const postPath = (post: Post) =>
  `/blog/${post.source === 'Medium' ? 'medium' : 'inovus'}/${new URL(post.url).pathname.split('/').filter(Boolean).pop()}`;

export async function allPosts(): Promise<Post[]> {
  const inovus = await getCollection('inovus');
  const medium = await getCollection('medium');
  return [
    ...inovus.map(({ data }) => ({ ...data })),
    ...medium.map(({ data }) => ({ ...data, source: 'Medium' })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
