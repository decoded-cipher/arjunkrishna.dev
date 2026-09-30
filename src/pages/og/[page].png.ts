import type { APIRoute } from 'astro';
import { card, type Card } from '../../lib/og';

const cards: Record<string, Card> = {
  home: {},
  projects: { title: 'Projects', line: 'Personal projects, built outside my day job.' },
  releases: { title: 'Releases', line: 'Tagged versions of the projects I still ship.' },
  blog: { title: 'Blog', line: 'Essays and notes, mostly about software, learning and the internet.' },
};

export const getStaticPaths = () => Object.keys(cards).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await card(cards[params.page!])), { headers: { 'Content-Type': 'image/png' } });
