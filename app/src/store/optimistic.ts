import type { Result } from '@/data/result';

/**
 * Surface a failed best-effort write instead of dropping it silently. Used by optimistic
 * store actions that update local state first, then persist. Returns whether it succeeded.
 */
export function reportFailure(label: string, res: Result<unknown>): boolean {
  if (!res.ok) console.warn(`${label} failed: ${res.error.message}`);
  return res.ok;
}
