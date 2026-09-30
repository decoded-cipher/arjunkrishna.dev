// Draws the site's fixed images: preview cards, favicons, app icons and the signature logo.
// They rarely change, so they live in the repository; run `bun run assets` after changing
// a card, the name or the icon, and commit what it writes.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { optimize } from 'svgo';
import { site } from '../src/site';

const colors = { bg: '#f3f2ee', text: '#2a2826', muted: '#6f6b64', rule: '#dedbd4', accent: '#c5370f' };

const cards: Record<string, Card> = {
  home: {
    line: 'Senior software engineer, working on system design and distributed systems.',
    items: ['System design', 'Distributed systems', 'IoT', 'Cloudflare Workers'],
  },
  projects: {
    title: 'Projects',
    line: 'Personal projects, built outside my day job.',
    items: ['Nodrix', 'BitNerve', 'Reelity', 'Zentro AI', 'NetMon'],
  },
  blog: {
    title: 'Blog',
    line: 'Essays and notes, mostly about software, learning and the internet.',
    items: ['Engineering', 'Learning', 'AI', 'Since 2019'],
  },
  releases: {
    title: 'Releases',
    line: 'Tagged versions of the projects I still ship.',
    items: ['nodrix', 'nodrix-sdk', 'netmon', 'auto-changelog'],
  },
  colophon: {
    title: 'Colophon',
    line: 'How this site is made.',
    items: ['Astro', 'No JavaScript', 'EB Garamond', 'GitHub Pages'],
  },
};

const woff = (pkg: string, file: string) => readFile(`node_modules/@fontsource/${pkg}/files/${file}.woff`);

// Regular and italic for the cards; bold italic for the monogram, so it holds up at 16 pixels.
const fonts = Promise.all(
  ([
    [400, 'normal'],
    [400, 'italic'],
    [700, 'italic'],
  ] as const).map(async ([weight, style]) => ({
    name: 'EB Garamond',
    data: await woff('eb-garamond', `eb-garamond-latin-${weight}-${style}`),
    weight,
    style,
  })),
);

type Node = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown> } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, props = {}): Node => ({
  type,
  props: { ...props, style: { display: 'flex', ...style }, children },
});

const display = { fontFamily: 'EB Garamond', fontStyle: 'italic', fontWeight: 400 };

async function svg(node: Node, width: number, height: number) {
  return satori(node as never, { width, height, fonts: await fonts });
}

interface Card {
  title?: string;
  line: string;
  items: string[];
}

// Paper, the signature and the page's own words; no photograph.
async function card({ title, line, items }: Card, signature: string) {
  const ink = `data:image/svg+xml;base64,${Buffer.from(signature.replaceAll('currentColor', colors.text)).toString('base64')}`;
  const [, , w, hgt] = signature.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number);
  const logo = (height: number) =>
    h('img', {}, undefined, { src: ink, height, width: Math.round((height * w) / hgt) });

  const middle = title
    ? [
        h('div', { ...display, fontSize: 150, lineHeight: 1, color: colors.text }, title),
        h('div', { paddingTop: 26, fontSize: 38, lineHeight: 1.3, color: colors.muted, maxWidth: 900 }, line),
      ]
    : [
        logo(190),
        h('div', { paddingTop: 34, fontSize: 38, lineHeight: 1.3, color: colors.muted, maxWidth: 900 }, line),
      ];

  const node = h(
    'div',
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 80px',
      background: colors.bg,
      fontFamily: 'EB Garamond',
    },
    [
      h('div', { justifyContent: 'space-between', alignItems: 'center', height: 64 }, [
        title ? logo(64) : h('div', { width: 72, height: 5, background: colors.accent }),
        h('span', { ...display, fontSize: 30, color: colors.accent }, 'arjunkrishna.dev'),
      ]),
      h('div', { flexDirection: 'column' }, middle),
      h(
        'div',
        { gap: 18, paddingTop: 22, borderTop: `1px solid ${colors.rule}`, fontSize: 28, color: colors.text },
        items.flatMap((item, i) => [
          ...(i ? [h('span', { color: colors.accent }, '·')] : []),
          h('span', {}, item),
        ]),
      ),
    ],
  );

  return sharp(Buffer.from(await svg(node, 1200, 630)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

// The AK monogram: bold italic EB Garamond in paper, on the vermilion accent.
async function iconSvg({ rounded = true } = {}) {
  const node = h(
    'div',
    {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.accent,
      borderRadius: rounded ? 14 : 0,
    },
    h(
      'div',
      { ...display, fontWeight: 700, fontSize: 37, letterSpacing: '-0.04em', marginTop: -4, marginLeft: -2, color: colors.bg },
      'AK',
    ),
  );
  return svg(node, 64, 64);
}

async function iconPng(size: number, options?: { rounded?: boolean }) {
  return sharp(Buffer.from(await iconSvg(options)))
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

function ico(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

// The name in Allison, as a single path that takes the text colour. SVGO rewrites the path with
// relative, shortened commands at a tenth of a unit, far below a pixel at the size it is shown.
async function logo() {
  const data = await woff('allison', 'allison-latin-400-normal');
  const drawn = await satori(
    h('div', { width: '100%', height: '100%', alignItems: 'center', paddingLeft: 60 }, [
      h('div', { fontFamily: 'Signature', fontSize: 96, color: 'black' }, site.name.replace(' ', '')),
    ]) as never,
    { width: 800, height: 200, fonts: [{ name: 'Signature', data, weight: 400, style: 'normal' }] },
  );

  const { info } = await sharp(Buffer.from(drawn)).trim().toBuffer({ resolveWithObject: true });
  const pad = 3;
  const box = [-info.trimOffsetLeft! - pad, -info.trimOffsetTop! - pad, info.width + pad * 2, info.height + pad * 2];
  const path = drawn.match(/ d="([^"]+)"/)![1];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" aria-hidden="true">` +
    `<path fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="${path}"/></svg>`;
  return `${optimize(svg, { floatPrecision: 1 }).data}\n`;
}

const signature = await logo();

const out: Record<string, Promise<string | Buffer>> = {
  'assets/logo.svg': Promise.resolve(signature),
  'public/favicon.svg': iconSvg(),
  'public/favicon.ico': Promise.all([16, 32, 48].map(async (size) => ({ size, data: await iconPng(size) }))).then(ico),
  'public/apple-touch-icon.png': iconPng(180, { rounded: false }),
  'public/icon-192.png': iconPng(192, { rounded: false }),
  'public/icon-512.png': iconPng(512, { rounded: false }),
  ...Object.fromEntries(Object.entries(cards).map(([name, data]) => [`public/og/${name}.jpg`, card(data, signature)])),
};

await mkdir('public/og', { recursive: true });
for (const [file, content] of Object.entries(out)) {
  const data = await content;
  await writeFile(file, data);
  console.log(`${file.padEnd(30)} ${(data.length / 1024).toFixed(1)} KB`);
}
