import { clip } from './text';

const API = 'https://blog.inovuslabs.org/ghost/api/content/posts/';
const KEY = 'de858d77141cc957615e54f70b';
const EXCLUDED = ['false-morality-of-mallus'];

type GhostPost = {
  slug: string;
  title: string;
  url: string;
  custom_excerpt: string | null;
  excerpt: string;
  published_at: string;
};

export async function loadInovusPosts() {
  const url = new URL(API);
  url.searchParams.set('key', KEY);
  url.searchParams.set('filter', 'authors:arjun');
  url.searchParams.set('fields', 'slug,title,url,custom_excerpt,excerpt,published_at');
  url.searchParams.set('limit', 'all');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Inovus Blogs returned ${res.status}`);
  const { posts } = (await res.json()) as { posts: GhostPost[] };

  return posts
    .filter((post) => !EXCLUDED.includes(post.slug))
    .map((post) => ({
      id: post.slug,
      title: post.title,
      url: post.url,
      date: post.published_at,
      excerpt: clip(post.custom_excerpt ?? post.excerpt),
    }));
}
