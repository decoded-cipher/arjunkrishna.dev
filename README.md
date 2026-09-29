# arjunkrishna.dev

The source for [arjunkrishna.dev](https://arjunkrishna.dev), my personal website: who I am, a few things I've built, and everything I've written.

It is a static site built with [Astro](https://astro.build). Pages ship as plain HTML and CSS, with no client-side JavaScript.

## What's here

- **Home** — a short bio with margin notes, a few projects, and recent writing.
- **Work** — projects outside my day job, each with its years, status, stack and links.
- **Writing** — every post, grouped by year. Most live on [Inovus Blogs](https://blog.inovuslabs.org/author/arjun/) and are pulled in at build time; older ones are on Medium.
- **RSS** at `/rss.xml`, a sitemap, and redirects from the old site's URLs.

## Running it

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev       # http://localhost:4321
bun run build     # static output in dist/
bun run preview   # serve dist/ locally
```

The build fetches my posts from the Inovus Blogs (Ghost) Content API, so it needs network access. The "last updated" date on the home page comes from git history.

## Editing content

Everything is in `src/content/`:

| File | What it holds |
|---|---|
| `home.mdx` | The home page bio and its margin notes |
| `projects/*.md` | One file per project: frontmatter for years, status, stack and links; the body is the description |
| `small.yaml` | The "Smaller things" list on the Work page |
| `medium.json` | Older posts on Medium |

A project with `featured: true` and a `homeLine` also appears on the home page. The portrait is `assets/portrait-1.jpg`, which is resized to AVIF and WebP at build time.

## How it's built

- **Astro 7**, static output, with MDX for the home page and content collections for projects and posts.
- **Fonts** — Cormorant Garamond and Crimson Pro, self-hosted and subset by Astro's Fonts API.
- **Styles** — one plain CSS file (`src/styles/site.css`). The margin notes, drop cap and hover excerpts are all CSS.
- **Links** — external links open in a new tab and carry `?ref=arjunkrishna.dev`.

## Deployment

GitHub Actions builds the site and deploys it to GitHub Pages ([`deploy.yml`](.github/workflows/deploy.yml)). A deploy runs:

- on every push to `master`;
- when I publish on Inovus Blogs — a Ghost webhook triggers a `repository_dispatch` event (`ghost-publish`);
- every Sunday, as a safety net;
- on demand, from the Actions tab.

---

The writing, photos and words on this site are mine. Please ask before reusing them.
