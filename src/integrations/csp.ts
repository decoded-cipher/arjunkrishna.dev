import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

// Writes a content security policy into each page, allowing only its own inline styles and scripts by hash.

const ANALYTICS = { script: 'https://static.cloudflareinsights.com', connect: 'https://cloudflareinsights.com' };
const DATA = /type="application\/(ld\+)?json"/;

const hash = (source: string) => `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

function policy(html: string) {
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => hash(match[1]));
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attributes]) => !/\bsrc=/.test(attributes) && !DATA.test(attributes))
    .map((match) => hash(match[2]));
  return [
    "default-src 'none'",
    `script-src ${[...new Set(scripts), ANALYTICS.script].join(' ')}`,
    `style-src ${[...new Set(styles)].join(' ') || "'none'"}`,
    "img-src 'self' https:",
    "font-src 'self'",
    `connect-src 'self' ${ANALYTICS.connect}`,
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

export default function csp(): AstroIntegration {
  return {
    name: 'csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const entries = await readdir(root, { withFileTypes: true, recursive: true });
        const pages = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'));
        let count = 0;
        for (const entry of pages) {
          const path = join(entry.parentPath, entry.name);
          const html = await readFile(path, 'utf8');
          const charset = html.match(/<meta charset="utf-8"\s*\/?>/i);
          if (!charset) continue;
          const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(html)}">`;
          await writeFile(path, html.replace(charset[0], `${charset[0]}${meta}`));
          count++;
        }
        logger.info(`policy written into ${count} pages`);
      },
    },
  };
}
