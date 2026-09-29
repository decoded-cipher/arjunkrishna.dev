const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const path = (to: string) => `${base}${to}`;

export const absolute = (to: string) => new URL(path(to), import.meta.env.SITE).href;
