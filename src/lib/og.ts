import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../site';

const colors = { bg: '#f3f2ee', text: '#2a2826', muted: '#6f6b64', rule: '#dedbd4', accent: '#c5370f' };

const woff = (pkg: string, file: string) => readFile(`node_modules/@fontsource/${pkg}/files/${file}.woff`);

const fonts = Promise.all(
  [
    [400, 'normal'],
    [400, 'italic'],
  ].map(async ([weight, style]) => ({
    name: 'EB Garamond',
    data: await woff('eb-garamond', `eb-garamond-latin-${weight}-${style}`),
    weight: weight as 400,
    style: style as 'normal' | 'italic',
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

const png = (svg: string, size?: number) => {
  const image = sharp(Buffer.from(svg));
  return (size ? image.resize(size, size) : image).png().toBuffer();
};

export interface Card {
  title?: string;
  line?: string;
}

export async function card({ title, line }: Card) {
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

  return png(await svg(node, 1200, 630));
}

export async function iconSvg({ rounded = true } = {}) {
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

export async function iconPng(size: number, options?: { rounded?: boolean }) {
  return png(await iconSvg(options), size);
}

export function ico(images: { size: number; data: Buffer }[]) {
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
