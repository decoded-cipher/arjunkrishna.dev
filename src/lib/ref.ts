const SITE = 'arjunkrishna.dev';

export function withRef(href: string): string {
  if (!/^https?:\/\//.test(href)) return href;
  const url = new URL(href);
  if (url.hostname === SITE || url.searchParams.has('ref')) return href;
  url.searchParams.set('ref', SITE);
  return url.toString();
}
