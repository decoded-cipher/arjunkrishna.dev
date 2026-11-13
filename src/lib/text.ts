export function clip(text: string, max = 200): string {
  const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  let out = '';
  for (const sentence of sentences) {
    if (out && (out + ' ' + sentence).length > max) break;
    out = out ? `${out} ${sentence}` : sentence;
  }
  if (out.length <= max) return out;
  return out.slice(0, out.lastIndexOf(' ', max)).replace(/[,;:—-]$/, '') + '…';
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function linked(text: string) {
  const parts: { text: string; href?: string }[] = [];
  let at = 0;
  for (const match of text.matchAll(LINK)) {
    if (match.index > at) parts.push({ text: text.slice(at, match.index) });
    parts.push({ text: match[1], href: match[2] });
    at = match.index + match[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at) });
  return parts;
}
