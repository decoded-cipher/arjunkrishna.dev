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
