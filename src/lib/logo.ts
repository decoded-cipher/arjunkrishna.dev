import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { site } from '../site';

async function render() {
  const data = await readFile(
    'node_modules/@fontsource/allison/files/allison-latin-400-normal.woff',
  );
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: { display: 'flex', width: '100%', height: '100%', alignItems: 'center', paddingLeft: 60 },
        children: { type: 'div', props: { style: { fontFamily: 'Signature', fontSize: 96, color: 'black' }, children: site.name.replace(' ', '') } },
      },
    } as never,
    { width: 800, height: 200, fonts: [{ name: 'Signature', data, weight: 400, style: 'normal' }] },
  );

  const { info } = await sharp(Buffer.from(svg)).trim().toBuffer({ resolveWithObject: true });
  const pad = 3;
  const box = [-info.trimOffsetLeft! - pad, -info.trimOffsetTop! - pad, info.width + pad * 2, info.height + pad * 2];

  return svg
    .replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" aria-hidden="true">`)
    .replaceAll('fill="black"', 'fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"');
}

let cached: Promise<string> | undefined;

export const logo = () => (cached ??= render());
