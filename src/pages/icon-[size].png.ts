import type { APIRoute } from 'astro';
import { iconPng } from '../lib/og';

export const getStaticPaths = () => [{ params: { size: '192' } }, { params: { size: '512' } }];

export const GET: APIRoute = async ({ params }) =>
  new Response(new Uint8Array(await iconPng(Number(params.size), { rounded: false })), {
    headers: { 'Content-Type': 'image/png' },
  });
