import { getCollection } from 'astro:content';
import type { Post } from '../components/PostList.astro';

export async function allPosts(): Promise<Post[]> {
  const inovus = await getCollection('inovus');
  const medium = await getCollection('medium');
  return [
    ...inovus.map(({ data }) => ({ ...data })),
    ...medium.map(({ data }) => ({ ...data, source: 'Medium' })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
