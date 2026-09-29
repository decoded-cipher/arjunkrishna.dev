# arjunkrishna.dev

Set in Garamond, served without a byte of JavaScript.

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
| `src/content/small.yaml` | Smaller things |
| `src/content/medium.json` | Medium posts |
| `assets/portrait-1.jpg` | Portrait |

Inovus Blogs posts are fetched at build time.

## Deploy

GitHub Pages, via Actions — on push to `master`, on publishing to Inovus Blogs, weekly, and on demand.
