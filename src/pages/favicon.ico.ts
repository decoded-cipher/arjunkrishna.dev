import type { APIRoute } from 'astro';
import { ico, iconPng } from '../lib/og';

export const GET: APIRoute = async () => {
  const images = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await iconPng(size) })));
  return new Response(new Uint8Array(ico(images)), { headers: { 'Content-Type': 'image/x-icon' } });
};
