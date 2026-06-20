/**
 * Explicit success/failure for data access. Repositories return a Result instead
 * of throwing, so every caller must handle the failure path — a network-backed
 * implementation can fail (offline, auth, server error) without crashing the UI.
 */

/** Why a repository read/write failed, so the UI can react (retry, sign-in, …). */
export interface RepoError {
  code: 'network' | 'not_found' | 'unauthorized' | 'unknown';
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: RepoError };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const fail = (code: RepoError['code'], message: string): Result<never> => ({
  ok: false,
  error: { code, message },
});
