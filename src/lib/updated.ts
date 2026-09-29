import { execFileSync } from 'node:child_process';

export function lastUpdated(...paths: string[]): Date {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { encoding: 'utf8' }).trim();
    if (iso) return new Date(iso);
  } catch {}
  return new Date();
}
