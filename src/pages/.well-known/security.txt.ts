import type { APIRoute } from 'astro';
import { absolute } from '../../lib/url';
import { site } from '../../site';

export const GET: APIRoute = () => {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  return new Response(
    [
      `Contact: mailto:${site.email}`,
      `Expires: ${expires.toISOString().replace(/\.\d+Z$/, 'Z')}`,
      'Preferred-Languages: en',
      `Canonical: ${absolute('/.well-known/security.txt')}`,
      '',
    ].join('\n'),
  );
};
