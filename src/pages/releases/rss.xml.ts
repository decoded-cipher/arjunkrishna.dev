import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allReleases } from '../../lib/releases';
import { absolute } from '../../lib/url';
import { site } from '../../site';

export async function GET(context: APIContext) {
  const releases = await allReleases();
  return rss({
    title: `Releases — ${site.name}`,
    description: 'Tagged versions of the projects I still ship.',
    site: new URL(import.meta.env.BASE_URL, context.site).href,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      '<language>en</language>',
      `<atom:link href="${absolute('/releases/rss.xml')}" rel="self" type="application/rss+xml"/>`,
    ].join(''),
    items: releases.map((release) => ({
      title: `${release.name} ${release.tag}`,
      link: absolute(`/releases/${release.slug}`),
      pubDate: release.date,
      description: release.summary,
      content: release.notes,
    })),
  });
}
