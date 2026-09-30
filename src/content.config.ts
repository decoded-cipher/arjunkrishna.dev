import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { loadInovusPosts } from './lib/ghost';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    years: z.string(),
    status: z.enum(['active', 'complete', 'maintained', 'archived']),
    order: z.number(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    parent: z.string().optional(),
    line: z.string().optional(),
    homeLine: z.string().optional(),
    stack: z.string(),
    releases: z.boolean().default(false),
    links: z
      .object({
        site: z.url().optional(),
        source: z.url().optional(),
        writeup: z.url().optional(),
      })
      .default({}),
  }),
});

const small = defineCollection({
  loader: file('src/content/small.yaml'),
  schema: z.object({
    name: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    line: z.string(),
    url: z.url(),
    releases: z.boolean().default(false),
  }),
});

const contributions = defineCollection({
  loader: file('src/content/contributions.yaml'),
  schema: z.object({
    repo: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    line: z.string(),
    url: z.url(),
  }),
});

const external = z.object({
  title: z.string(),
  date: z.coerce.date(),
  url: z.url(),
  excerpt: z.string(),
});

const inovus = defineCollection({
  loader: loadInovusPosts,
  schema: external,
});

const medium = defineCollection({
  loader: file('src/content/medium.json'),
  schema: external,
});

export const collections = { projects, small, contributions, inovus, medium };
