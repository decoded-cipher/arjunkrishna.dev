import { allPosts } from './posts';
import { allReleases } from './releases';
import { lastUpdated } from './updated';

const latest = (...dates: Date[]) => new Date(Math.max(...dates.map((date) => date.getTime())));

export async function lastmod() {
  const newest = (await allPosts())[0].date;
  const released = (await allReleases())[0]?.date ?? lastUpdated('src/content/projects', 'src/content/small.yaml');
  return {
    '/': latest(lastUpdated('src/content/home.mdx', 'src/content/projects'), newest),
    '/projects': lastUpdated('src/content/projects', 'src/content/small.yaml'),
    '/blog': newest,
    '/releases': released,
  };
}
