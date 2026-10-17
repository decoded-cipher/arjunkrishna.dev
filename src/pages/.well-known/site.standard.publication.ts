import type { APIRoute } from 'astro';
import { publication } from '../../lib/atproto';

export const GET: APIRoute = () => new Response(publication);
