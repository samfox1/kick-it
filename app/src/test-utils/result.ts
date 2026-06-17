import type { Result } from '../data/result';

/** Assert a repository Result succeeded and return its value (throws otherwise). */
export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(`Expected ok Result, got error: ${result.error.message}`);
  return result.value;
}
