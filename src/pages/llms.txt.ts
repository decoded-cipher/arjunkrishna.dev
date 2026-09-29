import type { APIRoute } from 'astro';
import { llms } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(await llms(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
