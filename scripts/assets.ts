// Draws the site's fixed images: preview cards, favicons, app icons and the signature logo.
// They rarely change, so they live in the repository; run `bun run assets` after changing
// the portrait, the tagline, a card or the icon, and commit what it writes.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { optimize } from 'svgo';
import { site } from '../src/site';

const colors = { bg: '#f3f2ee', text: '#2a2826', muted: '#6f6b64', rule: '#dedbd4', accent: '#c5370f' };

const cards: Record<string, Card> = {
  home: {},
  projects: { title: 'Projects', line: 'Personal projects, built outside my day job.' },
  blog: { title: 'Blog', line: 'Essays and notes, mostly about software, learning and the internet.' },
  releases: { title: 'Releases', line: 'Tagged versions of the projects I still ship.' },
  colophon: { title: 'Colophon', line: 'How this site is made.' },
};

const woff = (pkg: string, file: string) => readFile(`node_modules/@fontsource/${pkg}/files/${file}.woff`);

const fonts = Promise.all(
  (['normal', 'italic'] as const).map(async (style) => ({
    name: 'EB Garamond',
    data: await woff('eb-garamond', `eb-garamond-latin-400-${style}`),
    weight: 400 as const,
    style,
  })),
);

const portrait = sharp('assets/portrait-2.jpg')
  .resize(392, 490, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82 })
  .toBuffer()
  .then((buffer) => `data:image/jpeg;base64,${buffer.toString('base64')}`);

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
  line?: string;
}

async function card({ title, line }: Card) {
  const heading = title
    ? [
        h('div', { ...display, fontSize: 132, lineHeight: 1, color: colors.text }, title),
        h('div', { paddingTop: 22, fontSize: 36, lineHeight: 1.3, color: colors.muted }, line),
      ]
    : [
        h('div', { ...display, fontSize: 136, lineHeight: 0.92, color: colors.text }, 'Arjun'),
        h('div', { ...display, fontSize: 136, lineHeight: 0.92, color: colors.text }, 'Krishna'),
        h(
          'div',
          { paddingTop: 30, fontSize: 24, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.muted },
          site.tagline,
        ),
      ];

  const node = h(
    'div',
    {
      width: '100%',
      height: '100%',
      padding: 70,
      gap: 64,
      background: colors.bg,
      fontFamily: 'EB Garamond',
    },
    [
      h('div', { flex: 1, flexDirection: 'column', justifyContent: 'space-between' }, [
        h('div', { width: 64, height: 5, background: colors.accent }),
        h('div', { flexDirection: 'column' }, heading),
        h(
          'div',
          { justifyContent: 'space-between', paddingTop: 18, borderTop: `1px solid ${colors.rule}`, fontSize: 28 },
          [
            h('span', { ...display, color: colors.text }, title ? site.name : 'System design & distributed systems'),
            h('span', { fontStyle: 'italic', color: colors.accent }, 'arjunkrishna.dev'),
          ],
        ),
      ]),
      h('img', { width: 392, height: 490, objectFit: 'cover' }, undefined, {
        src: await portrait,
        width: 392,
        height: 490,
      }),
    ],
  );

  return sharp(Buffer.from(await svg(node, 1200, 630)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

async function iconSvg({ rounded = true } = {}) {
  const node = h(
    'div',
    {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.bg,
      borderRadius: rounded ? 14 : 0,
    },
    h('div', { ...display, fontSize: 76, lineHeight: 1, marginTop: -23, marginLeft: 5, color: colors.accent }, 'a'),
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
  ...Object.fromEntries(Object.entries(cards).map(([name, data]) => [`public/og/${name}.jpg`, card(data)])),
};

await mkdir('public/og', { recursive: true });
for (const [file, content] of Object.entries(out)) {
  const data = await content;
  await writeFile(file, data);
  console.log(`${file.padEnd(30)} ${(data.length / 1024).toFixed(1)} KB`);
}
