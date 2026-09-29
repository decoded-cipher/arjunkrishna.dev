const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const path = (to: string) => `${base}${to}`;
