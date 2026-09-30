import { execSync } from 'node:child_process';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import type { AstroIntegration } from 'astro';
import { longDate } from '../lib/date';

// Fills the colophon's <span data-stat="…"> placeholders with numbers from the finished build.

const PAGE = 'colophon.html';
const WEIGHED = { home: 'index.html', projects: 'projects.html', blog: 'blog.html', releases: 'releases.html', colophon: PAGE };

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)])),
  );
  return nested.flat();
}

const kb = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
const gzipped = async (path: string) => gzipSync(await readFile(path)).length;

function commit() {
  const sha = process.env.GITHUB_SHA ?? execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  return `<a href="https://github.com/decoded-cipher/arjunkrishna.dev/commit/${sha}">${sha.slice(0, 7)}</a>`;
}

function time(date: Date) {
  const ist = new Date(date.getTime() + 330 * 60 * 1000);
  return `${String(ist.getUTCHours()).padStart(2, '0')}:${String(ist.getUTCMinutes()).padStart(2, '0')} IST`;
}

export default function stats(): AstroIntegration {
  return {
    name: 'stats',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const page = join(root, PAGE);
        const all = await files(root);

        // Pages people read: not the 404 or the redirect stubs.
        const pages = (
          await Promise.all(
            all
              .filter((path) => path.endsWith('.html') && relative(root, path) !== '404.html')
              .map(async (path) => !(await readFile(path, 'utf8')).includes('http-equiv="refresh"')),
          )
        ).filter(Boolean).length;
        const scripts = all.filter((path) => path.endsWith('.js'));
        const styles = all.filter((path) => path.endsWith('.css'));
        const fonts = all.filter((path) => path.endsWith('.woff2'));
        const size = async (paths: string[], measure: (path: string) => Promise<number>) =>
          (await Promise.all(paths.map(measure))).reduce((sum, bytes) => sum + bytes, 0);

        const weights = await Promise.all(
          Object.entries(WEIGHED).map(async ([name, file]) => [`page-${name}`, `${kb(await gzipped(join(root, file)))}`]),
        );
        const total = await size(all, async (path) => (await stat(path)).size);
        // Styles are inlined into each page; measure them from the home page.
        const inline = [...(await readFile(join(root, 'index.html'), 'utf8')).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
          .map((match) => match[1])
          .join('');
        const built = new Date();

        const values: Record<string, string> = {
          pages: String(pages),
          javascript: scripts.length ? kb(await size(scripts, async (path) => (await stat(path)).size)) : 'None',
          css: styles.length
            ? `${styles.length} ${styles.length === 1 ? 'file' : 'files'}, ${kb(await size(styles, gzipped))} compressed`
            : `Inlined in each page, ${kb(gzipSync(inline).length)} compressed`,
          fonts: `${fonts.length} files, ${kb(await size(fonts, async (path) => (await stat(path)).size))}`,
          total: `${kb(total)} across ${all.length} files`,
          ...Object.fromEntries(weights),
          built: `${longDate(built)}, ${time(built)}, in ${(performance.now() / 1000).toFixed(1)} s`,
          commit: commit(),
        };

        const source = await readFile(page, 'utf8');
        const filled = source.replace(/<span data-stat="([\w-]+)">[^<]*<\/span>/g, (match, key) => values[key] ?? match);
        await writeFile(page, filled);
        logger.info(`colophon: ${Object.keys(values).length} numbers filled in`);
      },
    },
  };
}
