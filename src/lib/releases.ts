import { execSync } from 'node:child_process';
import { getCollection } from 'astro:content';
import { clip } from './text';

export type Release = {
  slug: string;
  name: string;
  repo: string;
  tag: string;
  url: string;
  date: Date;
  summary?: string;
  notes: string;
  // Visitors can't open a private repository, so its pages don't link to GitHub.
  private: boolean;
};

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  body: string | null;
  body_html?: string;
  html_url: string;
  published_at: string;
  draft: boolean;
};

const plain = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
    .trim();

// GitHub's rendered notes, without its classes and data attributes, and with headings one level down
// so they sit under the page's own title.
const tidy = (html = '') =>
  html
    .replace(/\s(?:class|data-[\w-]+)="[^"]*"/g, '')
    .replace(/<(\/?)h([1-5])\b/g, (_, slash, level) => `<${slash}h${Number(level) + 1}`)
    .replace(/<(\/?)tt>/g, '<$1code>')
    .trim();

// Links into a private repository, such as compare and blob links, reduced to their text.
const unlink = (html: string, repo: string) =>
  html.replace(
    new RegExp(`<a\\s[^>]*href="https://github\\.com/${repo.replaceAll('.', '\\.')}(?:[/?#][^"]*)?"[^>]*>([\\s\\S]*?)</a>`, 'gi'),
    '$1',
  );

// The part of the release name after "—", unless it is only a date; otherwise the first paragraph of the notes.
function summary({ name, body }: GitHubRelease) {
  const subtitle = name?.split(' — ')[1];
  if (subtitle && !/\d{4}$/.test(subtitle)) return `${subtitle.charAt(0).toUpperCase()}${subtitle.slice(1)}.`;
  const paragraph = (body ?? '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^(#|[-*+] |\d+\. |\||>|```|---)/.test(block));
  return paragraph ? clip(plain(paragraph), 160) : undefined;
}

// CI passes GITHUB_TOKEN; locally, borrow the GitHub CLI's token so builds don't hit the anonymous rate limit.
function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

const auth = token();

const github = (path: string) =>
  fetch(`https://api.github.com/repos/${path}`, {
    headers: {
      Accept: 'application/vnd.github.full+json',
      ...(auth && { Authorization: `Bearer ${auth}` }),
    },
  });

async function fetchReleases(project: string, url: string): Promise<Release[]> {
  const repo = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)/)?.[1];
  if (!repo) throw new Error(`[releases] ${project}: not a GitHub repository (${url})`);

  // Private repositories need a token that can read them; CI's default token only covers this one.
  const [meta, res] = await Promise.all([github(repo), github(`${repo}/releases?per_page=100`)]);
  const failed = [meta, res].find((r) => !r.ok);
  if (failed) {
    const message = `[releases] ${repo}: GitHub returned ${failed.status}`;
    // A failed fetch shouldn't take the dev server down; a production build should stop instead.
    if (import.meta.env.DEV) {
      console.warn(message);
      return [];
    }
    throw new Error(message);
  }

  const { private: hidden } = (await meta.json()) as { private: boolean };
  return ((await res.json()) as GitHubRelease[])
    .filter((release) => !release.draft)
    .map((release) => ({
      slug: `${repo.split('/')[1]}-${release.tag_name}`.toLowerCase(),
      name: repo.split('/')[1],
      repo,
      tag: release.tag_name,
      url: release.html_url,
      date: new Date(release.published_at),
      summary: summary(release),
      notes: hidden ? unlink(tidy(release.body_html), repo) : tidy(release.body_html),
      private: hidden,
    }));
}

async function load() {
  const projects = await getCollection('projects', ({ data }) => data.releases && !data.draft);
  const small = await getCollection('small', ({ data }) => data.releases);
  const repos = [
    ...projects.map(({ data }) => [data.name, data.links.source ?? ''] as const),
    ...small.map(({ data }) => [data.name, data.url] as const),
  ];
  return (await Promise.all(repos.map(([project, url]) => fetchReleases(project, url))))
    .flat()
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

let cached: Promise<Release[]> | undefined;

export const allReleases = () => (cached ??= load());
