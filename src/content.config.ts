import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    years: z.string(),
    status: z.enum(['active', 'complete', 'maintained', 'archived']),
    order: z.number(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    homeLine: z.string().optional(),
    stack: z.string(),
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
  }),
});

export const collections = { projects, small };
