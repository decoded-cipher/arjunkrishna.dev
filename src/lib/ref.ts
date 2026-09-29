const SITE = 'arjunkrishna.dev';

const isExternal = (href: string) => /^https?:\/\//.test(href) && new URL(href).hostname !== SITE;

function withRef(href: string): string {
  const url = new URL(href);
  if (url.searchParams.has('ref')) return href;
  url.searchParams.set('ref', SITE);
  return url.toString();
}

export function external(href: string, { ref = true } = {}) {
  if (!isExternal(href)) return { href };
  return { href: ref ? withRef(href) : href, target: '_blank' };
}
