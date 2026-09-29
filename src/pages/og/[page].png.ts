import type { APIRoute } from 'astro';
import { card, type Card } from '../../lib/og';

const cards: Record<string, Card> = {
  home: {},
  work: { title: 'Work', line: 'Things I have built outside my day job.' },
  writing: { title: 'Writing', line: 'Essays and notes, mostly about software, learning and the internet.' },
};

export const getStaticPaths = () => Object.keys(cards).map((page) => ({ params: { page } }));

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await card(cards[params.page!])), { headers: { 'Content-Type': 'image/png' } });
