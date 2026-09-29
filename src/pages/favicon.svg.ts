import type { APIRoute } from 'astro';
import { iconSvg } from '../lib/og';

export const GET: APIRoute = async () =>
  new Response(await iconSvg(), { headers: { 'Content-Type': 'image/svg+xml' } });
