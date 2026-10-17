import { mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// Moves the Standard.site records out of the build, where scripts/atproto.ts picks them up.

export const FILE = 'site.standard.json';
export const OUT = '.astro';

export default function standard(): AstroIntegration {
  return {
    name: 'standard',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        await mkdir(OUT, { recursive: true });
        await rename(join(fileURLToPath(dir), FILE), join(OUT, FILE));
        logger.info(`records moved to ${join(OUT, FILE)}`);
      },
    },
  };
}
