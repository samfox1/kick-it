import { fail, type Result, type RepoError } from '@/data/result';

/** A PostgREST/Supabase-ish error: any of these fields may be present. */
type SupabaseErrorLike = { code?: string; status?: number; message?: string } | null | undefined;

/** Translate a Supabase/PostgREST error into the app's RepoError taxonomy. */
export function mapPostgrestError(error: SupabaseErrorLike): RepoError {
  const message = error?.message ?? 'Unknown error';

  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return { code: 'unauthorized', message };
  }
  if (error?.code === 'PGRST116') {
    return { code: 'not_found', message };
  }
  if (/network|fetch failed|failed to fetch/i.test(message)) {
    return { code: 'network', message };
  }
  return { code: 'unknown', message };
}

/** Convenience: wrap a Supabase error directly into a failed Result. */
export function failFrom(error: SupabaseErrorLike): Result<never> {
  const e = mapPostgrestError(error);
  return fail(e.code, e.message);
}
