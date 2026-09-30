import { readFile } from 'node:fs/promises';
import { getCollection } from 'astro:content';
import { site } from '../site';
import { allPosts } from './posts';
import { allReleases } from './releases';
import { monthYear } from './date';
import { absolute } from './url';

const statusLabel = { active: 'Active', complete: 'Complete', maintained: 'Maintained', archived: 'Archived' };

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

async function projects() {
  return (await getCollection('projects', ({ data }) => !data.draft))
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ id, data, body = '' }) => ({
      id,
      ...data,
      body: body.trim(),
      url: data.links.site ?? data.links.source ?? data.links.writeup ?? absolute(`/projects#${id}`),
    }));
}

async function bio() {
  const mdx = await readFile('src/content/home.mdx', 'utf8');
  return mdx
    .replace(/^import .*$/gm, '')
    .replace(/<Margin>[\s\S]*?<\/Margin>/g, '')
    .replace(
      /<Quote source="([^"]+)" href="([^"]+)" year=\{(\d+)\}>\s*([\s\S]*?)\s*<\/Quote>/g,
      (_, source, href, year, text) => `> ${text}\n>\n> — from [${source}](${href}), ${year}`,
    )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const facts = () =>
  [
    `- Role: ${site.jobTitle} at [${site.employer.name}](${site.employer.url}); before that, software engineer at [Airtory](https://www.airtory.com) (2022–2024)`,
    '- Based in: Kerala, India',
    `- Community: mentor at [${site.community.name}](${site.community.url}), the innovation centre of ${site.college}, since 2018`,
    `- Education: BCA and MCA, ${site.college}`,
    `- Contact: ${site.email}`,
  ].join('\n');

const links = () =>
  [...site.profiles, ...site.elsewhere].map((profile) => `- [${profile.name}](${profile.url})`).join('\n');

export async function llms() {
  const posts = await allPosts();
  return `# ${site.name}

> ${site.summary}

${facts()}

## Pages

- [Home](${absolute('/')}): about me, a few things I've made, and recent posts
- [Projects](${absolute('/projects')}): personal projects, built outside my day job
- [Releases](${absolute('/releases')}): tagged versions of those projects, newest first
- [Blog](${absolute('/blog')}): essays and notes since 2019
- [Colophon](${absolute('/colophon')}): how this site is built, with numbers from the latest build
- [RSS](${absolute('/rss.xml')}): feed of all posts

## Projects

${(await projects()).map((project) => `- [${project.name}](${project.url}): ${project.body}`).join('\n')}

## Recent posts

${posts
  .slice(0, 10)
  .map((post) => `- [${post.title}](${post.url}): ${post.excerpt}`)
  .join('\n')}

## Elsewhere

${links()}

## Optional

- [Everything on this site, in one file](${absolute('/llms-full.txt')})
`;
}

export async function llmsFull() {
  const posts = await allPosts();
  const small = (await getCollection('small')).sort((a, b) => b.data.date.localeCompare(a.data.date));

  const all = await projects();
  const projectText = all
    .map((project) =>
      [
        `### ${project.name}`,
        '',
        `${project.years} · ${statusLabel[project.status]} · ${project.stack}${project.parent ? ` · part of ${all.find((p) => p.id === project.parent)?.name}` : ''}`,
        '',
        project.body,
        '',
        project.links.site && `- Site: ${project.links.site}`,
        project.links.source && `- Source: ${project.links.source}`,
        project.links.writeup && `- Write-up: ${project.links.writeup}`,
      ]
        .filter((line) => line !== undefined)
        .join('\n')
        .trim(),
    )
    .join('\n\n');

  return `# ${site.name}

> ${site.summary}

Source: ${absolute('/')}

${facts()}

## About

${await bio()}

## Projects

Things I have built outside my day job.

${projectText}

## Contributions

Other people's open-source projects I have contributed to.

${(await getCollection('contributions'))
  .sort((a, b) => b.data.date.localeCompare(a.data.date))
  .map(({ data }) => `- [${data.repo}](${data.url}) (${monthYear(data.date)}): ${data.line}`)
  .join('\n')}

## Tinkering

${small.map(({ data }) => `- [${data.name}](${data.url}) (${monthYear(data.date)}): ${data.line}`).join('\n')}

## Releases

${(await allReleases())
  .map((release) => `- ${isoDay(release.date)} — [${release.name} ${release.tag}](${absolute(`/releases/${release.slug}`)})${release.summary ? `: ${release.summary}` : ''}`)
  .join('\n')}

## Blog

Essays and notes, mostly about software, learning and the internet. Most are published on Inovus Blogs; the older ones on Medium.

${posts
  .map((post) => `- ${isoDay(post.date)} — [${post.title}](${post.url})${post.source ? ` (${post.source})` : ''}: ${post.excerpt}`)
  .join('\n')}

## Elsewhere

${links()}
`;
}
