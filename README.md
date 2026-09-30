# arjunkrishna.dev

My personal site — projects, blog, and zero JavaScript.

Astro · Bun · GitHub Pages

## Run

```sh
bun install
bun run dev
bun run build
bun run preview
```

## Content

| Path | |
|---|---|
| `src/content/home.mdx` | Bio and margin notes |
| `src/content/projects/*.md` | Projects — `featured` and `homeLine` put one on the home page |
| `src/content/small.yaml` | Tinkering |
| `src/content/medium.json` | Medium posts |
| `src/site.ts` | Name, title, descriptions, profiles, topics |
| `assets/portrait-2.jpg` | Portrait |

Inovus Blogs posts are fetched at build time.

## Images

The preview cards, favicons, app icons and the signature logo are drawn by `scripts/assets.ts` (Satori, sharp,
SVGO) and committed to `public/` and `assets/`. They are not part of the build; after changing a card,
the name or the icon, run:

```sh
bun run assets
```

## Generated

| Output | From |
|---|---|
| JSON-LD on every page | `src/lib/schema.ts` |
| `/llms.txt`, `/llms-full.txt` | `src/lib/llms.ts` |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/manifest.webmanifest` | `src/pages/` |

## Deploy

GitHub Pages, via Actions — on push to `master`, on publishing to Inovus Blogs, weekly, and on demand. New URLs
go to IndexNow after each deploy.

`SITE_URL` and `BASE_PATH` set the origin and path; they default to `https://arjunkrishna.dev` and `/`.
