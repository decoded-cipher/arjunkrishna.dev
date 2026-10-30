import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Link = { label: string; href: string };

export const homeOf = ({ data }: Project) => data.links.site ?? data.links.source ?? data.links.writeup!;

export const restOf = ({ data }: Project) =>
  [
    data.links.site && data.links.source && { label: 'Source', href: data.links.source },
    data.links.writeup && (data.links.site || data.links.source) && { label: 'Write-up', href: data.links.writeup },
    ...data.links.more.map(({ label, url }) => ({ label, href: url })),
  ].filter(Boolean) as Link[];
