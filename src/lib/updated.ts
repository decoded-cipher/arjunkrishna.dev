import { execFileSync } from 'node:child_process';

export function lastUpdated(path: string): Date {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim();
    if (iso) return new Date(iso);
  } catch {}
  return new Date();
}
